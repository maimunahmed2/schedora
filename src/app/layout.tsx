import type {Metadata} from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { isConfigured } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import './globals.css';

export const metadata: Metadata = {
  title: 'ClassPulse',
  description: 'The single source of truth for your class timetable.',
};

function FirebaseNotConfigured() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/40">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Firebase Configuration Required</CardTitle>
                    <CardDescription>
                        Your app needs to connect to Firebase, but the configuration is missing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                        Please follow these steps to get your app running:
                    </p>
                    <ol className="list-decimal list-inside space-y-3">
                        <li>
                            In your Firebase project, go to
                            <strong className="text-foreground"> Project Settings</strong> (click the gear icon <code className="p-1 bg-muted rounded-sm text-foreground">⚙️</code> next to "Project Overview").
                        </li>
                        <li>
                            Under the "General" tab, find your web app in the "Your apps" section.
                        </li>
                        <li>
                            Select the "SDK setup and configuration" section and choose <strong>Config</strong>.
                        </li>
                        <li>
                            Copy the Firebase configuration object keys and values.
                        </li>
                        <li>
                            In this editor, open the <code className="p-1 bg-muted rounded-sm text-foreground">.env.local</code> file from the file list on the left.
                        </li>
                        <li>
                           Paste the values into <code className="p-1 bg-muted rounded-sm text-foreground">.env.local</code>. It should look like this, using your project's actual values:
                            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345...
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345...:web:...`}
                            </pre>
                        </li>
                         <li>
                            <strong>Important:</strong> After saving the file, you must <strong>restart the development server</strong> for the changes to apply.
                        </li>
                    </ol>
                </CardContent>
            </Card>
        </main>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const renderApp = () => (
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
    );

    return (
        <html lang="en" suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </head>
          <body className="font-body antialiased">
            {isConfigured ? renderApp() : <FirebaseNotConfigured />}
          </body>
        </html>
    );
}
