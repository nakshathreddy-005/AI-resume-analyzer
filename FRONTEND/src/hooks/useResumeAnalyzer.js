import { useCallback, useEffect, useMemo, useState } from 'react'

import { API_URL, getErrorMessage, getNetworkErrorMessage } from '../constants/api'
import { createTextPdfBlob } from '../utils/pdf'

const emptyAuth = {
  username: '',
  email: '',
  password: '',
}

export function useResumeAnalyzer() {
  const [mode, setMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuth)
  const [token, setToken] = useState(() => localStorage.getItem('resumeAnalyzerToken') || '')
  const [user, setUser] = useState(null)
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [jobs, setJobs] = useState([])
  const [modifiedResume, setModifiedResume] = useState('')
  const [loading, setLoading] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedResumeId),
    [resumes, selectedResumeId],
  )

  const authedFetch = useCallback(
    (path, options = {}) =>
      fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }),
    [token],
  )

  const applyResumeAnalysis = (resume) => {
    setAnalysis(resume?.analysis || null)
    setJobs(resume?.analysis?.recommendedJobs || [])
    setModifiedResume(resume?.analysis?.modifiedResume || '')
  }

  const loadResumes = useCallback(async () => {
    if (!token) return

    const response = await authedFetch('/resume')
    if (!response.ok) throw new Error(await getErrorMessage(response))

    const data = await response.json()
    setResumes(data)

    if (!selectedResumeId && data.length) {
      setSelectedResumeId(data[0]._id)
      applyResumeAnalysis(data[0])
    }
  }, [authedFetch, selectedResumeId, token])

  useEffect(() => {
    const loadSession = async () => {
      if (!token) return

      setLoading('session')
      setError('')

      try {
        const meResponse = await authedFetch('/auth/me')
        if (!meResponse.ok) throw new Error(await getErrorMessage(meResponse))

        setUser(await meResponse.json())
        await loadResumes()
      } catch (err) {
        localStorage.removeItem('resumeAnalyzerToken')
        setToken('')
        setUser(null)
        setResumes([])
        setError(getNetworkErrorMessage(err))
      } finally {
        setLoading('')
      }
    }

    loadSession()
  }, [authedFetch, loadResumes, token])

  const handleAuth = async (event) => {
    event.preventDefault()
    setLoading('auth')
    setError('')
    setNotice('')

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body =
        mode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : authForm

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(await getErrorMessage(response))

      const data = await response.json()
      localStorage.setItem('resumeAnalyzerToken', data.token)
      setToken(data.token)
      setUser(data.payload)
      setNotice(data.message || 'Signed in successfully')
      return true
    } catch (err) {
      setError(getNetworkErrorMessage(err))
      return false
    } finally {
      setLoading('')
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!selectedFile) {
      setError('Choose a PDF resume first')
      return
    }

    setLoading('upload')
    setError('')
    setNotice('')

    try {
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const response = await authedFetch('/resume/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error(await getErrorMessage(response))

      const resume = await response.json()
      setResumes((current) => [resume, ...current])
      setSelectedResumeId(resume._id)
      setAnalysis(null)
      setJobs([])
      setModifiedResume('')
      setSelectedFile(null)
      event.target.reset()
      setNotice('Resume uploaded. Ready for analysis.')
      return true
    } catch (err) {
      setError(getNetworkErrorMessage(err))
      return false
    } finally {
      setLoading('')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setError('Upload or select a resume first')
      return
    }

    setLoading('analysis')
    setError('')
    setNotice('')

    try {
      const response = await authedFetch(`/analysis/${selectedResumeId}`, {
        method: 'POST',
        body: JSON.stringify({ jobRole }),
      })

      if (!response.ok) throw new Error(await getErrorMessage(response))

      const data = await response.json()
      setAnalysis(data.data)
      setJobs(data.jobs || data.data?.recommendedJobs || [])
      setModifiedResume(data.data?.modifiedResume || '')
      setNotice('Analysis complete.')
      await loadResumes()
      return true
    } catch (err) {
      setError(getNetworkErrorMessage(err))
      return false
    } finally {
      setLoading('')
    }
  }

  const handleResumeChange = (resumeId) => {
    const resume = resumes.find((item) => item._id === resumeId)
    setSelectedResumeId(resumeId)
    applyResumeAnalysis(resume)
  }

  const handleRewriteResume = async () => {
    if (!selectedResumeId) {
      setError('Upload or select a resume first')
      return
    }

    if (!analysis?.suggestions?.length) {
      setError('Run analysis first so the resume can be improved from the suggestions')
      return
    }

    setLoading('rewrite')
    setError('')
    setNotice('')

    try {
      const response = await authedFetch(`/analysis/${selectedResumeId}/rewrite`, {
        method: 'POST',
        body: JSON.stringify({ jobRole }),
      })

      if (!response.ok) throw new Error(await getErrorMessage(response))

      const data = await response.json()
      const nextResume = data.data?.modifiedResume || ''

      setModifiedResume(nextResume)
      setAnalysis((current) => ({
        ...(current || {}),
        modifiedResume: nextResume,
        roleFocus: data.data?.roleFocus || current?.roleFocus || null,
      }))
      setNotice('Modified resume generated. You can download it now.')
      await loadResumes()
      return true
    } catch (err) {
      setError(getNetworkErrorMessage(err))
      return false
    } finally {
      setLoading('')
    }
  }

  const downloadModifiedResume = () => {
    if (!modifiedResume) {
      setError('Generate a modified resume first')
      return
    }

    const resumeName = selectedResume?.fileName?.replace(/\.pdf$/i, '') || 'resume'
    const blob = createTextPdfBlob(modifiedResume)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${resumeName}-modified.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const logout = () => {
    localStorage.removeItem('resumeAnalyzerToken')
    setToken('')
    setUser(null)
    setResumes([])
    setSelectedResumeId('')
    setAnalysis(null)
    setJobs([])
    setModifiedResume('')
    setNotice('Signed out.')
  }

  return {
    analysis,
    authForm,
    downloadModifiedResume,
    error,
    handleAnalyze,
    handleAuth,
    handleResumeChange,
    handleRewriteResume,
    handleUpload,
    jobRole,
    jobs,
    loading,
    logout,
    mode,
    modifiedResume,
    notice,
    resumes,
    selectedResume,
    selectedResumeId,
    setAuthForm,
    setJobRole,
    setMode,
    setSelectedFile,
    token,
    user,
  }
}
