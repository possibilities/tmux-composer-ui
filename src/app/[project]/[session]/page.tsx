import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getProjectDetails, getSessionDetails } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFullProjectPath } from '@/lib/utils'

type SessionPane = {
  index: string
  width: number
  height: number
  currentCommand: string
  currentPath: string
  content: string
}

type SessionWindow = {
  index: number
  name: string
  active: boolean
  panes: SessionPane[]
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ project: string; session: string }>
}) {
  const { project, session } = await params
  const decodedProject = decodeURIComponent(project)
  const decodedSession = decodeURIComponent(session)

  const projectPath = getFullProjectPath(decodedProject)
  const projectDetails = await getProjectDetails(projectPath)
  const sessionDetails = await getSessionDetails(decodedSession)

  return (
    <div className='min-h-screen p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8 flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild className='h-8 w-8'>
            <Link href='/'>
              <ChevronLeft className='h-4 w-4' />
              <span className='sr-only'>Back to home</span>
            </Link>
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${decodedProject}`}>{decodedProject}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{decodedSession}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='space-y-8'>
          {sessionDetails.success && sessionDetails.data?.session?.windows && (
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Session Panes</CardTitle>
                </CardHeader>
              </Card>
              {sessionDetails.data.session.windows.flatMap(
                (window: SessionWindow) =>
                  window.panes.flatMap((pane: SessionPane) => {
                    const paneIdentifier = `${decodedSession}-${window.name}-${pane.index}`
                    return [
                      <Card key={`${paneIdentifier}-pre`}>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            {window.name} - Pane {pane.index} [pre]
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className='overflow-auto rounded-md bg-muted p-4 text-xs'>
                            {pane.content}
                          </pre>
                        </CardContent>
                      </Card>,
                      <Card key={`${paneIdentifier}-term`}>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            {window.name} - Pane {pane.index} [term]
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className='overflow-auto rounded-md bg-muted p-4 text-xs'>
                            {pane.content}
                          </pre>
                        </CardContent>
                      </Card>,
                    ]
                  }),
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {projectDetails.success ? (
                <pre className='overflow-auto rounded-md bg-muted p-4'>
                  {JSON.stringify(projectDetails.data, null, 2)}
                </pre>
              ) : (
                <div className='text-destructive'>
                  Error loading project details: {projectDetails.error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionDetails.success ? (
                <pre className='overflow-auto rounded-md bg-muted p-4'>
                  {JSON.stringify(sessionDetails.data, null, 2)}
                </pre>
              ) : (
                <div className='text-destructive'>
                  Error loading session details: {sessionDetails.error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
