import { useState } from 'react'

import Header from './Header'
import { useResumeAnalyzer } from '../hooks/useResumeAnalyzer'
import CredentialsPage from '../pages/CredentialsPage'
import ResultsPage from '../pages/ResultsPage'
import ResumeAnalyzerPage from '../pages/ResumeAnalyzerPage'

function Home() {
  const analyzer = useResumeAnalyzer()
  const [page, setPage] = useState(() => (localStorage.getItem('resumeAnalyzerToken') ? 'analyzer' : 'credentials'))
  const activePage = analyzer.token ? page : 'credentials'

  const handleAuth = async (event) => {
    const currentMode = analyzer.mode

    const didAuthenticate = await analyzer.handleAuth(event)

    if (didAuthenticate) {
      if (currentMode === 'register') {
        analyzer.setMode('login')
        analyzer.setAuthForm({ username: '', email: '', password: '' })
      } else {
        setPage('analyzer')
      }
    }
  }

  const handleAnalyze = async () => {
    const didAnalyze = await analyzer.handleAnalyze()
    if (didAnalyze) setPage('results')
  }

  const handleLogout = () => {
    analyzer.logout()
    setPage('credentials')
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-zinc-950">
      <Header onLogout={handleLogout} user={analyzer.user} />

      {activePage === 'credentials' && (
        <CredentialsPage
          authForm={analyzer.authForm}
          error={analyzer.error}
          loading={analyzer.loading}
          mode={analyzer.mode}
          notice={analyzer.notice}
          onAuth={handleAuth}
          onAuthFormChange={analyzer.setAuthForm}
          onModeChange={analyzer.setMode}
        />
      )}

      {activePage === 'analyzer' && (
        <ResumeAnalyzerPage
          error={analyzer.error}
          hasAnalysis={Boolean(analyzer.analysis)}
          jobRole={analyzer.jobRole}
          loading={analyzer.loading}
          notice={analyzer.notice}
          onAnalyze={handleAnalyze}
          onFileChange={analyzer.setSelectedFile}
          onJobRoleChange={analyzer.setJobRole}
          onResumeChange={analyzer.handleResumeChange}
          onShowResults={() => setPage('results')}
          onUpload={analyzer.handleUpload}
          resumes={analyzer.resumes}
          selectedResume={analyzer.selectedResume}
          selectedResumeId={analyzer.selectedResumeId}
          token={analyzer.token}
        />
      )}

      {activePage === 'results' && (
        <ResultsPage
          analysis={analyzer.analysis}
          error={analyzer.error}
          jobs={analyzer.jobs}
          loading={analyzer.loading}
          modifiedResume={analyzer.modifiedResume}
          notice={analyzer.notice}
          onBack={() => setPage('analyzer')}
          onDownload={analyzer.downloadModifiedResume}
          onRewrite={analyzer.handleRewriteResume}
          selectedResume={analyzer.selectedResume}
          selectedResumeId={analyzer.selectedResumeId}
          token={analyzer.token}
        />
      )}
    </main>
  )
}

export default Home
