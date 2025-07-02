import React from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Account information (email, name, password)</li>
                  <li>Project and task data you create</li>
                  <li>Usage data and analytics</li>
                  <li>Communication data when you contact us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and operate our services</li>
                  <li>Process your transactions</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Improve our services and develop new features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to access, update, or delete your personal information. 
                  You can do this through your account settings or by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at 
                  ua@kanba.co.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}