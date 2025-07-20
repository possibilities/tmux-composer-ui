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
import { getProjectDetails } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFullProjectPath } from '@/lib/utils'

export default async function SessionDetailPage({
  params,
}: {
  params: { project: string; session: string }
}) {
  const { project, session } = await params
  const decodedProject = decodeURIComponent(project)
  const decodedSession = decodeURIComponent(session)

  const projectPath = getFullProjectPath(decodedProject)
  const projectDetails = await getProjectDetails(projectPath)

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
      </div>
    </div>
  )
}
