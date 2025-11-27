import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import axios from 'axios'

interface ErrorStateProps {
  error: Error | unknown
  onRetry?: () => void
  className?: string
}

interface ErrorConfig {
  icon: React.ReactNode
  title: string
  description: string
  iconClassName: string
}

function getErrorConfig(error: Error | unknown): ErrorConfig {
  // Check for Axios errors with status codes
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (!error.response && error.code === 'ERR_NETWORK') {
      return {
        icon: <WifiOff className="h-6 w-6" />,
        title: 'No internet connection',
        description: 'Please check your network connection and try again',
        iconClassName: 'bg-yellow-100 text-yellow-600',
      }
    }

    switch (status) {
      case 400:
        return {
          icon: <Ban className="h-6 w-6" />,
          title: 'Bad request',
          description: error.response?.data?.message || 'The request was invalid. Please try again.',
          iconClassName: 'bg-orange-100 text-orange-600',
        }
      case 401:
        return {
          icon: <Ban className="h-6 w-6" />,
          title: 'Unauthorized',
          description: 'Please sign in to continue',
          iconClassName: 'bg-yellow-100 text-yellow-600',
        }
      case 403:
        return {
          icon: <Ban className="h-6 w-6" />,
          title: 'Access denied',
          description: "You don't have permission to access this resource",
          iconClassName: 'bg-orange-100 text-orange-600',
        }
      case 404:
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          title: 'Not found',
          description: 'The resource you are looking for does not exist',
          iconClassName: 'bg-muted text-muted-foreground',
        }
      case 500:
        return {
          icon: <ServerCrash className="h-6 w-6" />,
          title: 'Server error',
          description: 'Something went wrong on our end. Please try again later.',
          iconClassName: 'bg-destructive/10 text-destructive',
        }
      case 502:
      case 503:
      case 504:
        return {
          icon: <ServerCrash className="h-6 w-6" />,
          title: 'Service unavailable',
          description: 'The server is temporarily unavailable. Please try again later.',
          iconClassName: 'bg-destructive/10 text-destructive',
        }
      default:
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          title: 'Something went wrong',
          description: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
          iconClassName: 'bg-destructive/10 text-destructive',
        }
    }
  }

  // Generic error handling
  if (error instanceof Error) {
    return {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Something went wrong',
      description: error.message || 'An unexpected error occurred',
      iconClassName: 'bg-destructive/10 text-destructive',
    }
  }

  return {
    icon: <AlertCircle className="h-6 w-6" />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    iconClassName: 'bg-destructive/10 text-destructive',
  }
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const config = getErrorConfig(error)

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={config.iconClassName}>
          {config.icon}
        </EmptyMedia>
        <EmptyTitle className="font-serif">{config.title}</EmptyTitle>
        <EmptyDescription>{config.description}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry} className="rounded-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
