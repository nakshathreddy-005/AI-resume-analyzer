import AlertBanner from '../components/AlertBanner'
import AuthForm from '../components/AuthForm'

function CredentialsPage({
  authForm,
  error,
  loading,
  mode,
  notice,
  onAuth,
  onAuthFormChange,
  onModeChange,
}) {
  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <AlertBanner error={error} notice={notice} />

      <div className="mt-6">
        <AuthForm
          authForm={authForm}
          loading={loading}
          mode={mode}
          onAuth={onAuth}
          onAuthFormChange={onAuthFormChange}
          onModeChange={onModeChange}
        />
      </div>
    </div>
  )
}

export default CredentialsPage
