'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Building } from 'lucide-react'; // Building icon for Visionarius
import { useRouter } from 'next/navigation'; // For redirecting after login if needed (handled by AuthContext)

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, signUpWithEmail, isAuthenticating } = useAuth(); // Assuming signInWithEmail is implemented in AuthContext
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSignUp) {
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">{isSignUp ? "Create Account" : "Visionarius CRM"}</CardTitle>
          <CardDescription>{isSignUp ? "Join us to revolutionize your sales." : "Sign in to access your dashboard."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAuthenticating}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isAuthenticating}
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base" disabled={isAuthenticating}>
              {isAuthenticating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={isAuthenticating}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Powered by Firebase Authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
