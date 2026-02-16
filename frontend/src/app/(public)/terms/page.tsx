"use client";

export default function TermsPage() {
  return (
    <section className="bg-smoke-200 py-12 lg:py-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-0 max-w-4xl">
         <h1 className="text-4xl font-bold text-brand-500/90 mb-8">Terms of Service</h1>
         
         <div className="prose prose-lg text-brand-500/80">
            <p>Welcome to EnStore. Please read these terms carefully before using our service.</p>
            
            <h3>1. General</h3>
            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h3>2. Use of Service</h3>
            <p>You agree to use our service for lawful purposes only. We reserve the right to limit or suspend your access if you violate these terms.</p>
            
            <h3>3. Payments</h3>
            <p>All payments are final and non-refundable unless otherwise stated in our refund policy.</p>
            
            <h3>4. Limitation of Liability</h3>
            <p>EnStore shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.</p>
            
            <p className="mt-8 text-sm text-brand-500/40">Last updated: January 2026</p>
         </div>
      </div>
    </section>
  );
}
