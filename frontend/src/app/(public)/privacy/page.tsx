"use client";

export default function PrivacyPage() {
  return (
    <section className="bg-white py-12 lg:py-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-0 max-w-4xl">
         <h1 className="text-4xl font-black text-brand-500 mb-8">Privacy Policy</h1>
         
         <div className="prose prose-lg text-brand-500/80">
            <p>Your privacy is important to us. This policy explains how we collect and use your data.</p>
            
            <h3>1. Information We Collect</h3>
            <p>We may collect personal information such as your name, email address, and payment details when you use our service.</p>
            
            <h3>2. How We Use Your Information</h3>
            <p>We use your information to process transactions, improve our services, and communicate with you about your account.</p>
            
            <h3>3. Data Security</h3>
            <p>We implement security measures to protect your personal information against unauthorized access or disclosure.</p>
            
            <h3>4. Cookies</h3>
            <p>Our website uses cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings.</p>
            
            <p className="mt-8 text-sm text-brand-500/40">Last updated: January 2026</p>
         </div>
      </div>
    </section>
  );
}
