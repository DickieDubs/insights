'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Users, Bell, Plug, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Key,
  Globe,
  Lock,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

const generalSettingsSchema = z.object({
  platformName: z
    .string()
    .min(2, 'Platform name must be at least 2 characters'),
  timezone: z.string(),
  dateFormat: z.string(),
  enableMaintenance: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  defaultLanguage: z.string(),
})

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
]

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  isSystem?: boolean
}

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all platform features',
    permissions: ['*'],
    isSystem: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage clients and view reports',
    permissions: ['clients.manage', 'reports.view', 'settings.view'],
    isSystem: true,
  },
  {
    id: 'user',
    name: 'User',
    description: 'Basic access to assigned features',
    permissions: ['reports.view'],
    isSystem: true,
  },
]

const availablePermissions = [
  {
    category: 'Clients',
    permissions: [
      { id: 'clients.view', label: 'View Clients' },
      { id: 'clients.create', label: 'Create Clients' },
      { id: 'clients.edit', label: 'Edit Clients' },
      { id: 'clients.delete', label: 'Delete Clients' },
    ],
  },
  {
    category: 'Reports',
    permissions: [
      { id: 'reports.view', label: 'View Reports' },
      { id: 'reports.create', label: 'Create Reports' },
      { id: 'reports.edit', label: 'Edit Reports' },
      { id: 'reports.delete', label: 'Delete Reports' },
    ],
  },
  {
    category: 'Settings',
    permissions: [
      { id: 'settings.view', label: 'View Settings' },
      { id: 'settings.edit', label: 'Edit Settings' },
    ],
  },
  {
    category: 'Users',
    permissions: [
      { id: 'users.view', label: 'View Users' },
      { id: 'users.create', label: 'Create Users' },
      { id: 'users.edit', label: 'Edit Users' },
      { id: 'users.delete', label: 'Delete Users' },
    ],
  },
]

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  type: 'email' | 'in-app'
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {platformName}',
    body: "Welcome to {platformName}! We're excited to have you on board.\n\nYour account has been created successfully. You can now access all the features available to your role.\n\nIf you have any questions, please don't hesitate to contact our support team.",
    type: 'email',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    body: "Hello,\n\nYou have requested to reset your password. Click the link below to set a new password:\n\n{resetLink}\n\nIf you didn't request this, please ignore this email.\n\nThis link will expire in 24 hours.",
    type: 'email',
  },
  {
    id: 'new-client',
    name: 'New Client Notification',
    subject: 'New Client Registration',
    body: 'A new client has registered: {clientName}\n\nClient Details:\n- Email: {clientEmail}\n- Role: {clientRole}\n\nPlease review and approve their account if required.',
    type: 'in-app',
  },
]

const notificationEvents = [
  {
    category: 'Account',
    events: [
      {
        id: 'account.created',
        name: 'Account Created',
        description: 'When a new account is created',
        defaultChannels: ['email', 'in-app'],
      },
      {
        id: 'account.updated',
        name: 'Account Updated',
        description: 'When account details are modified',
        defaultChannels: ['in-app'],
      },
      {
        id: 'password.changed',
        name: 'Password Changed',
        description: 'When a password is changed',
        defaultChannels: ['email'],
      },
    ],
  },
  {
    category: 'Client Management',
    events: [
      {
        id: 'client.created',
        name: 'New Client',
        description: 'When a new client is added',
        defaultChannels: ['email', 'in-app'],
      },
      {
        id: 'client.updated',
        name: 'Client Updated',
        description: 'When client details are modified',
        defaultChannels: ['in-app'],
      },
      {
        id: 'client.deleted',
        name: 'Client Deleted',
        description: 'When a client is removed',
        defaultChannels: ['in-app'],
      },
    ],
  },
  {
    category: 'Reports',
    events: [
      {
        id: 'report.generated',
        name: 'Report Generated',
        description: 'When a new report is generated',
        defaultChannels: ['email', 'in-app'],
      },
      {
        id: 'report.shared',
        name: 'Report Shared',
        description: 'When a report is shared with you',
        defaultChannels: ['email', 'in-app'],
      },
    ],
  },
]

interface Integration {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  icon?: React.ReactNode
  config: {
    apiKey?: string
    webhookUrl?: string
    scopes?: string[]
    endpoints?: { name: string; url: string }[]
  }
}

const availableIntegrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments, manage subscriptions, and handle billing',
    status: 'disconnected',
    icon: <Globe className="h-5 w-5" />,
    config: {
      apiKey: '',
      webhookUrl: '',
      scopes: ['read', 'write'],
      endpoints: [
        { name: 'Payments', url: 'https://api.stripe.com/v1/payments' },
        { name: 'Customers', url: 'https://api.stripe.com/v1/customers' },
      ],
    },
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Send transactional emails and manage email templates',
    status: 'disconnected',
    icon: <Globe className="h-5 w-5" />,
    config: {
      apiKey: '',
      scopes: ['mail.send', 'templates.read'],
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and alerts to Slack channels',
    status: 'disconnected',
    icon: <Globe className="h-5 w-5" />,
    config: {
      webhookUrl: '',
      scopes: ['chat:write', 'channels:read'],
    },
  },
]

interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high'
  category: 'authentication' | 'authorization' | 'data' | 'network'
}

const securityPolicies: SecurityPolicy[] = [
  {
    id: 'password-policy',
    name: 'Password Policy',
    description:
      'Enforce strong password requirements and regular password changes',
    enabled: true,
    severity: 'high',
    category: 'authentication',
  },
  {
    id: 'mfa',
    name: 'Multi-Factor Authentication',
    description: 'Require MFA for all users or specific roles',
    enabled: false,
    severity: 'high',
    category: 'authentication',
  },
  {
    id: 'session-timeout',
    name: 'Session Timeout',
    description:
      'Automatically log out inactive users after a specified period',
    enabled: true,
    severity: 'medium',
    category: 'authentication',
  },
  {
    id: 'ip-restriction',
    name: 'IP Restriction',
    description: 'Restrict access to specific IP addresses or ranges',
    enabled: false,
    severity: 'high',
    category: 'network',
  },
  {
    id: 'data-encryption',
    name: 'Data Encryption',
    description: 'Enable encryption for sensitive data at rest and in transit',
    enabled: true,
    severity: 'high',
    category: 'data',
  },
]

interface IntegrationFormValues {
  scopes: string[]
  apiKey?: string
  webhookUrl?: string
}

interface SecurityFormValues {
  sessionTimeout: number
  allowedIPs: string
}

export default function PlatformSettingsPage() {
  const { toast } = useToast()
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platformName: 'Insights Platform',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      enableMaintenance: false,
      maintenanceMessage: '',
      defaultLanguage: 'en',
    },
  })

  const integrationForm = useForm<IntegrationFormValues>({
    defaultValues: {
      scopes: [],
      apiKey: '',
      webhookUrl: '',
    },
  })

  const securityForm = useForm<SecurityFormValues>({
    defaultValues: {
      sessionTimeout: 30,
      allowedIPs: '',
    },
  })

  // Role management state
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  })

  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null)
  const [notificationPreferences, setNotificationPreferences] = useState<
    Record<string, string[]>
  >(
    Object.fromEntries(
      notificationEvents.flatMap((category) =>
        category.events.map((event) => [event.id, event.defaultChannels])
      )
    )
  )

  // Integration management state
  const [integrations, setIntegrations] = useState<Integration[]>(
    availableIntegrations
  )
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null)
  const [securityPoliciesState, setSecurityPoliciesState] =
    useState<SecurityPolicy[]>(securityPolicies)
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false)

  const onSubmit = async (data: GeneralSettingsFormValues) => {
    try {
      // TODO: Implement API call to save settings
      console.log('Saving settings:', data)
      toast({
        title: 'Settings saved',
        description: 'Your platform settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRoleSubmit = async (data: RoleFormValues) => {
    try {
      if (editingRole) {
        // Update existing role
        setRoles(
          roles.map((role) =>
            role.id === editingRole.id ? { ...role, ...data } : role
          )
        )
        toast({
          title: 'Role updated',
          description: `Role "${data.name}" has been updated successfully.`,
        })
      } else {
        // Create new role
        const newRole: Role = {
          id: data.name.toLowerCase().replace(/\s+/g, '-'),
          ...data,
        }
        setRoles([...roles, newRole])
        toast({
          title: 'Role created',
          description: `Role "${data.name}" has been created successfully.`,
        })
      }
      setIsRoleDialogOpen(false)
      setEditingRole(null)
      roleForm.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save role. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    roleForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setIsRoleDialogOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      toast({
        title: 'Cannot delete system role',
        description: 'System roles cannot be deleted.',
        variant: 'destructive',
      })
      return
    }
    setRoles(roles.filter((r) => r.id !== role.id))
    toast({
      title: 'Role deleted',
      description: `Role "${role.name}" has been deleted.`,
    })
  }

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
  }

  const handleTemplateUpdate = (
    templateId: string,
    updates: Partial<NotificationTemplate>
  ) => {
    // TODO: Implement template update logic
    console.log('Updating template:', templateId, updates)
    toast({
      title: 'Template updated',
      description: 'Notification template has been updated successfully.',
    })
  }

  const handleNotificationPreferenceChange = (
    eventId: string,
    channels: string[]
  ) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [eventId]: channels,
    }))
    // TODO: Implement API call to save preferences
    toast({
      title: 'Preferences updated',
      description: 'Notification preferences have been updated.',
    })
  }

  const handleIntegrationUpdate = (
    integrationId: string,
    updates: Partial<Integration>
  ) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, ...updates }
          : integration
      )
    )
    // TODO: Implement API call to update integration
    toast({
      title: 'Integration updated',
      description: 'Integration settings have been updated successfully.',
    })
  }

  const handleSecurityPolicyToggle = (policyId: string, enabled: boolean) => {
    setSecurityPoliciesState((prev) =>
      prev.map((policy) =>
        policy.id === policyId ? { ...policy, enabled } : policy
      )
    )
    // TODO: Implement API call to update security policy
    toast({
      title: 'Security policy updated',
      description: `Security policy has been ${
        enabled ? 'enabled' : 'disabled'
      }.`,
    })
  }

  const getSeverityColor = (severity: SecurityPolicy['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <ProtectedLayout>
      <PageHeader title="Platform Settings" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Alert>
          <AlertDescription>
            This section is under construction. New features and settings will
            be added soon.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex items-center gap-2"
            >
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure basic platform settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="platformName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter platform name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The name that will be displayed throughout the
                            platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Timezone</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timezones.map((tz) => (
                                  <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The default timezone for the platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dateFormats.map((format) => (
                                  <SelectItem
                                    key={format.value}
                                    value={format.value}
                                  >
                                    {format.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The default date format for the platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The default language for the platform interface
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="enableMaintenance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Maintenance Mode
                              </FormLabel>
                              <FormDescription>
                                Enable maintenance mode to restrict access to
                                the platform
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('enableMaintenance') && (
                        <FormField
                          control={form.control}
                          name="maintenanceMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maintenance Message</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter maintenance message"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Message to display when maintenance mode is
                                active
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      Reset
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Roles & Permissions</CardTitle>
                  <CardDescription>
                    Manage user roles and their associated permissions
                  </CardDescription>
                </div>
                <Dialog
                  open={isRoleDialogOpen}
                  onOpenChange={setIsRoleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRole
                          ? 'Modify the role details and permissions'
                          : 'Create a new role and assign permissions'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={roleForm.handleSubmit(handleRoleSubmit)}>
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={roleForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter role name"
                                  {...field}
                                  disabled={editingRole?.isSystem}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={roleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter role description"
                                  {...field}
                                  disabled={editingRole?.isSystem}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={roleForm.control}
                          name="permissions"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Permissions</FormLabel>
                                <FormDescription>
                                  Select the permissions for this role
                                </FormDescription>
                              </div>
                              <ScrollArea className="h-[300px] rounded-md border p-4">
                                {availablePermissions.map((category) => (
                                  <div key={category.category} className="mb-6">
                                    <h4 className="mb-2 font-medium">
                                      {category.category}
                                    </h4>
                                    <div className="grid gap-2">
                                      {category.permissions.map(
                                        (permission) => (
                                          <FormField
                                            key={permission.id}
                                            control={roleForm.control}
                                            name="permissions"
                                            render={({ field }) => (
                                              <FormItem
                                                key={permission.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(
                                                      permission.id
                                                    )}
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      const currentPermissions =
                                                        field.value || []
                                                      if (checked) {
                                                        field.onChange([
                                                          ...currentPermissions,
                                                          permission.id,
                                                        ])
                                                      } else {
                                                        field.onChange(
                                                          currentPermissions.filter(
                                                            (id) =>
                                                              id !==
                                                              permission.id
                                                          )
                                                        )
                                                      }
                                                    }}
                                                    disabled={
                                                      editingRole?.isSystem
                                                    }
                                                  />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                  {permission.label}
                                                </FormLabel>
                                              </FormItem>
                                            )}
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </ScrollArea>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsRoleDialogOpen(false)
                            setEditingRole(null)
                            roleForm.reset()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{role.name}</h4>
                          {role.isSystem && (
                            <Badge variant="secondary">System</Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission === '*'
                                ? 'All Permissions'
                                : permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit role</span>
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete role</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Templates</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {notificationTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary'
                            : 'hover:border-muted-foreground/50'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {template.type === 'email'
                              ? 'Email Template'
                              : 'In-App Template'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Subject:</div>
                            <div className="text-sm text-muted-foreground">
                              {template.subject}
                            </div>
                            <div className="text-sm font-medium">Preview:</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {template.body}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    {notificationEvents.map((category) => (
                      <div key={category.category} className="space-y-4">
                        <h4 className="font-medium">{category.category}</h4>
                        <div className="space-y-4">
                          {category.events.map((event) => (
                            <div
                              key={event.id}
                              className="flex flex-col space-y-2 rounded-lg border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="font-medium">
                                    {event.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {event.description}
                                  </p>
                                </div>
                                <RadioGroup
                                  value={
                                    notificationPreferences[event.id]?.[0] ||
                                    'none'
                                  }
                                  onValueChange={(value) =>
                                    handleNotificationPreferenceChange(
                                      event.id,
                                      value === 'none' ? [] : [value]
                                    )
                                  }
                                  className="flex items-center space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="email"
                                      id={`${event.id}-email`}
                                    />
                                    <Label htmlFor={`${event.id}-email`}>
                                      Email
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="in-app"
                                      id={`${event.id}-in-app`}
                                    />
                                    <Label htmlFor={`${event.id}-in-app`}>
                                      In-App
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="none"
                                      id={`${event.id}-none`}
                                    />
                                    <Label htmlFor={`${event.id}-none`}>
                                      None
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTemplate && (
                  <Dialog
                    open={!!selectedTemplate}
                    onOpenChange={() => setSelectedTemplate(null)}
                  >
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          Edit Template: {selectedTemplate.name}
                        </DialogTitle>
                        <DialogDescription>
                          Customize the notification template content
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          // TODO: Implement template update
                          setSelectedTemplate(null)
                        }}
                      >
                        <div className="grid gap-4 py-4">
                          <FormField
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={selectedTemplate.subject}
                                    onChange={(e) =>
                                      handleTemplateUpdate(
                                        selectedTemplate.id,
                                        {
                                          subject: e.target.value,
                                        }
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            name="body"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Body</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={selectedTemplate.body}
                                    onChange={(e) =>
                                      handleTemplateUpdate(
                                        selectedTemplate.id,
                                        {
                                          body: e.target.value,
                                        }
                                      )
                                    }
                                    className="min-h-[200px]"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Available variables: {'{platformName}'},{' '}
                                  {'{clientName}'}, {'{clientEmail}'},{' '}
                                  {'{resetLink}'}
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedTemplate(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Manage third-party integrations and API connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations.map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          {integration.icon}
                          <CardTitle className="text-base">
                            {integration.name}
                          </CardTitle>
                        </div>
                        {getStatusIcon(integration.status)}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <Badge
                            variant={
                              integration.status === 'connected'
                                ? 'default'
                                : integration.status === 'error'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {integration.status.charAt(0).toUpperCase() +
                              integration.status.slice(1)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration)
                              setIsIntegrationDialogOpen(true)
                            }}
                          >
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Dialog
                  open={isIntegrationDialogOpen}
                  onOpenChange={setIsIntegrationDialogOpen}
                >
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        Configure {selectedIntegration?.name} Integration
                      </DialogTitle>
                      <DialogDescription>
                        Set up your {selectedIntegration?.name} integration
                        settings
                      </DialogDescription>
                    </DialogHeader>
                    {selectedIntegration && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          // TODO: Implement integration update
                          setIsIntegrationDialogOpen(false)
                        }}
                      >
                        <div className="grid gap-4 py-4">
                          {selectedIntegration.config.apiKey && (
                            <FormField
                              control={integrationForm.control}
                              name="apiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>API Key</FormLabel>
                                  <FormControl>
                                    <div className="flex space-x-2">
                                      <Input
                                        type="password"
                                        {...field}
                                        value={
                                          selectedIntegration.config.apiKey
                                        }
                                        onChange={(e) =>
                                          handleIntegrationUpdate(
                                            selectedIntegration.id,
                                            {
                                              config: {
                                                ...selectedIntegration.config,
                                                apiKey: e.target.value,
                                              },
                                            }
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          // TODO: Implement API key generation
                                          toast({
                                            title: 'API Key Generated',
                                            description:
                                              'A new API key has been generated.',
                                          })
                                        }}
                                      >
                                        <Key className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Your {selectedIntegration.name} API key
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          )}

                          {selectedIntegration.config.webhookUrl && (
                            <FormField
                              control={integrationForm.control}
                              name="webhookUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Webhook URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={
                                        selectedIntegration.config.webhookUrl
                                      }
                                      onChange={(e) =>
                                        handleIntegrationUpdate(
                                          selectedIntegration.id,
                                          {
                                            config: {
                                              ...selectedIntegration.config,
                                              webhookUrl: e.target.value,
                                            },
                                          }
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Webhook URL for {selectedIntegration.name}{' '}
                                    notifications
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          )}

                          {selectedIntegration.config.scopes && (
                            <FormField
                              control={integrationForm.control}
                              name="scopes"
                              render={() => (
                                <FormItem>
                                  <FormLabel>Required Scopes</FormLabel>
                                  <div className="space-y-2">
                                    {selectedIntegration.config.scopes?.map(
                                      (scope) => (
                                        <div
                                          key={scope}
                                          className="flex items-center space-x-2"
                                        >
                                          <Checkbox
                                            id={`scope-${scope}`}
                                            checked={true}
                                            disabled
                                          />
                                          <Label htmlFor={`scope-${scope}`}>
                                            {scope}
                                          </Label>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <FormDescription>
                                    Required permissions for{' '}
                                    {selectedIntegration.name}
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsIntegrationDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Security Policies</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Security Score
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current security score: 75/100</p>
                          <Progress value={75} className="mt-2" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-4">
                    {securityPoliciesState.map((policy) => (
                      <Card key={policy.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {policy.name}
                              <Badge
                                variant="outline"
                                className={getSeverityColor(policy.severity)}
                              >
                                {policy.severity.charAt(0).toUpperCase() +
                                  policy.severity.slice(1)}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {policy.description}
                            </CardDescription>
                          </div>
                          <Switch
                            checked={policy.enabled}
                            onCheckedChange={(checked) =>
                              handleSecurityPolicyToggle(policy.id, checked)
                            }
                          />
                        </CardHeader>
                        {policy.enabled && (
                          <CardContent>
                            <div className="rounded-lg bg-muted p-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertTriangle className="h-4 w-4" />
                                <p>
                                  This policy is currently active. Disabling it
                                  may reduce your security posture.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Access Control</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Session Management
                        </CardTitle>
                        <CardDescription>
                          Configure user session settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={securityForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={5}
                                  max={1440}
                                  {...field}
                                  value="30"
                                  onChange={(e) => {
                                    // TODO: Implement session timeout update
                                    console.log(
                                      'Session timeout:',
                                      e.target.value
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Time before inactive users are logged out
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          IP Restrictions
                        </CardTitle>
                        <CardDescription>
                          Manage IP-based access controls
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={securityForm.control}
                          name="allowedIPs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allowed IP Addresses</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter IP addresses (one per line)"
                                  className="min-h-[100px]"
                                  {...field}
                                  value=""
                                  onChange={(e) => {
                                    // TODO: Implement IP restrictions update
                                    console.log(
                                      'IP restrictions:',
                                      e.target.value
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                List of allowed IP addresses or ranges
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
