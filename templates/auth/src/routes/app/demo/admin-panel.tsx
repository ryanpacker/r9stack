/**
 * Demo: Admin Panel — Pattern C
 *
 * This page demonstrates role-based access control (RBAC) using WorkOS permissions.
 * The Convex functions check for specific permission strings from the JWT claims.
 *
 * Key learning: Permissions are configured in the WorkOS Dashboard, not in code.
 * Your code only CHECKS what WorkOS already decided. If the user doesn't have
 * the required permission, the Convex function throws an error.
 *
 * SETUP REQUIRED: See the instructions on this page for configuring WorkOS RBAC.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { ShieldAlert, ShieldCheck, Settings } from 'lucide-react'

export const Route = createFileRoute('/app/demo/admin-panel')({
  component: AdminPanelDemo,
})

function AdminPanelDemo() {
  const permissionCheck = useQuery(api.adminSettings.checkPermissions)

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-4">
        Pattern C: Role-Based
      </span>

      {/* Explanation */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How this works</h3>
        <p className="text-sm text-muted-foreground mb-2">
          The functions in <code className="bg-muted px-1 py-0.5 rounded text-xs">convex/adminSettings.ts</code>{' '}
          check for specific permissions from the JWT. For example, the list query
          requires the <code className="bg-muted px-1 py-0.5 rounded text-xs">settings:read</code> permission.
        </p>
        <p className="text-sm text-muted-foreground">
          Permissions are configured in the{' '}
          <a
            href="https://dashboard.workos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            WorkOS Dashboard
          </a>{' '}
          under Roles & Permissions. They are included in the JWT automatically.
        </p>
      </div>

      {/* Permission Status */}
      {permissionCheck === undefined ? (
        <p className="text-sm text-muted-foreground">Checking permissions...</p>
      ) : (
        <>
          <PermissionStatus permissionCheck={permissionCheck} />

          {permissionCheck.hasSettingsRead ? (
            <AdminSettingsPanel canWrite={permissionCheck.hasSettingsWrite ?? false} />
          ) : (
            <SetupInstructions />
          )}
        </>
      )}
    </div>
  )
}

function PermissionStatus({
  permissionCheck,
}: {
  permissionCheck: {
    authenticated: boolean
    permissions: string[]
    hasSettingsRead?: boolean
    hasSettingsWrite?: boolean
  }
}) {
  return (
    <div className="border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold mb-3">Your Permissions</h3>
      <div className="space-y-2">
        <PermissionRow
          name="settings:read"
          has={permissionCheck.hasSettingsRead ?? false}
          description="View admin settings"
        />
        <PermissionRow
          name="settings:write"
          has={permissionCheck.hasSettingsWrite ?? false}
          description="Modify admin settings"
        />
      </div>
      {permissionCheck.permissions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            All permissions from JWT:{' '}
            <code className="bg-muted px-1 py-0.5 rounded">
              {JSON.stringify(permissionCheck.permissions)}
            </code>
          </p>
        </div>
      )}
    </div>
  )
}

function PermissionRow({
  name,
  has,
  description,
}: {
  name: string
  has: boolean
  description: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {has ? (
        <ShieldCheck className="w-4 h-4 text-green-600" />
      ) : (
        <ShieldAlert className="w-4 h-4 text-muted-foreground" />
      )}
      <code className="bg-muted px-1 py-0.5 rounded text-xs">{name}</code>
      <span className="text-muted-foreground">— {description}</span>
      <span
        className={`text-xs font-medium ${has ? 'text-green-600' : 'text-muted-foreground'}`}
      >
        {has ? 'Granted' : 'Not granted'}
      </span>
    </div>
  )
}

function AdminSettingsPanel({ canWrite }: { canWrite: boolean }) {
  const settings = useQuery(api.adminSettings.list)
  const updateSetting = useMutation(api.adminSettings.update)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim() || !newValue.trim()) return
    await updateSetting({ key: newKey.trim(), value: newValue.trim() })
    setNewKey('')
    setNewValue('')
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Admin Settings
      </h2>

      {/* Settings List */}
      {settings === undefined ? (
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      ) : settings.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">
          No settings configured yet.{' '}
          {canWrite ? 'Add one below!' : 'Need settings:write permission to add.'}
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {settings.map((setting) => (
            <div
              key={setting._id}
              className="flex items-center justify-between border border-border rounded-md p-3"
            >
              <div>
                <code className="text-sm font-semibold">{setting.key}</code>
                <span className="text-muted-foreground mx-2">=</span>
                <code className="text-sm">{setting.value}</code>
              </div>
              <span className="text-xs text-muted-foreground">
                Updated {new Date(setting.updatedAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add/Update Form */}
      {canWrite && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Key</label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="setting_name"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Value</label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="value"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            />
          </div>
          <Button type="submit" disabled={!newKey.trim() || !newValue.trim()}>
            Save
          </Button>
        </form>
      )}
    </div>
  )
}

function SetupInstructions() {
  return (
    <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-6 bg-amber-50 dark:bg-amber-950/30">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-600" />
        Access Denied — Setup Required
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Your account does not have the <code className="bg-muted px-1 py-0.5 rounded">settings:read</code>{' '}
        permission. This is expected! You need to configure roles and permissions in WorkOS.
      </p>
      <div className="space-y-3 text-sm">
        <h4 className="font-semibold">Setup Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            Go to the{' '}
            <a
              href="https://dashboard.workos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              WorkOS Dashboard
            </a>
          </li>
          <li>Navigate to <strong>Roles</strong> and create an &ldquo;admin&rdquo; role</li>
          <li>Navigate to <strong>Permissions</strong> and create:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><code className="bg-muted px-1 py-0.5 rounded">settings:read</code></li>
              <li><code className="bg-muted px-1 py-0.5 rounded">settings:write</code></li>
            </ul>
          </li>
          <li>Assign both permissions to the &ldquo;admin&rdquo; role</li>
          <li>Create an <strong>Organization</strong> and add your user with the admin role</li>
          <li>Sign out and sign back in (to refresh the JWT with new permissions)</li>
        </ol>
      </div>
    </div>
  )
}
