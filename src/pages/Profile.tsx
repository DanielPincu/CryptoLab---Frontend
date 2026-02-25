import { useEffect, useState } from 'react'
import { http } from '../api/http.api'
import { apiUserUpdateMe, apiUserMe } from '../api/user.api'
import type { IUser } from '../interfaces/user.interface'

export default function Profile() {
  const [me, setMe] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ username: '', email: '' })

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPw, setChangingPw] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await apiUserMe()
        setMe(user)
      } catch {
        setProfileError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (me) {
      setForm({ username: me.username, email: me.email })
    }
  }, [me])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!me) return

    const previous = me
    const optimistic = { ...me, ...form }

    try {
      setSaving(true)
      setProfileError(null)
      setSuccess(null)

      setMe(optimistic)

      const updated = await apiUserUpdateMe(form)
      setMe(updated)
      setEditing(false)
      setSuccess('Profile updated successfully')
    } catch {
      setMe(previous)
      setProfileError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setProfileError('Passwords do not match')
      return
    }

    try {
      setChangingPw(true)
      setProfileError(null)
      setSuccess(null)

      await http.patch('/user/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })

      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Password changed successfully')
    } catch {
      setProfileError('Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-300">Loading profile…</div>
  }

  if (!me) {
    return <div className="p-6 text-rose-400">Profile not available</div>
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="font-semibold mb-2">Profile</h2>

      {success && <div className="mb-2 text-emerald-400 text-sm">{success}</div>}
      {profileError && <div className="mb-2 text-rose-400 text-sm">{profileError}</div>}

      {!editing ? (
        <>
          <div className="text-sm text-slate-300">
            Username: <span className="font-mono">{me.username}</span>
          </div>
          <div className="text-sm text-slate-300">
            Email: <span className="font-mono">{me.email}</span>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-3 text-emerald-400 underline"
          >
            Edit profile
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded bg-slate-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-slate-800 pt-4">
        <h3 className="text-sm font-semibold mb-2">Change Password</h3>

        <div className="flex flex-col gap-3">
          <input
            type="password"
            name="currentPassword"
            value={pwForm.currentPassword}
            onChange={handlePwChange}
            placeholder="Current password"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />
          <input
            type="password"
            name="newPassword"
            value={pwForm.newPassword}
            onChange={handlePwChange}
            placeholder="New password"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />
          <input
            type="password"
            name="confirmPassword"
            value={pwForm.confirmPassword}
            onChange={handlePwChange}
            placeholder="Confirm new password"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />

          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="px-3 py-1 rounded bg-emerald-600 text-white text-sm w-fit"
          >
            {changingPw ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}