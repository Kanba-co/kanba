import React from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Kanba, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground">
                  Permission is granted to temporarily access Kanba for personal, 
                  non-commercial transitory viewing only.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>This is the grant of a license, not a transfer of title</li>
                  <li>You may not modify or copy the materials</li>
                  <li>You may not use the materials for commercial purposes</li>
                  <li>You may not attempt to reverse engineer any software</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Responsibilities</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account 
                  and password and for restricting access to your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
                <p className="text-muted-foreground">
                  Subscription fees are billed in advance on a monthly basis and are non-refundable. 
                  You can cancel your subscription at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
                <p className="text-muted-foreground">
                  You may not use Kanba for any unlawful purpose or to solicit others 
                  to perform unlawful acts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall Kanba or its suppliers be liable for any damages 
                  arising out of the use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at 
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