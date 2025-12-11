import { useState } from 'react';
import { Header } from '../../components/Header';
import { CompanySection } from './sections/CompanySection';
import { FooterLinksSection } from './sections/FooterLinksSection';
import { FormHeaderSection } from './sections/FormHeaderSection';
import { PasswordSection } from './sections/PasswordSection';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SubmitSection } from './sections/SubmitSection';

export function RegistroReclutador() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const companies = [
    'Empresa 1',
    'Empresa 2',
    'Empresa 3',
    'Empresa 4',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <FormHeaderSection />

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <PersonalInfoSection
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            onChange={handleInputChange}
          />

          <PasswordSection
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onChange={handleInputChange}
          />

          <CompanySection
            company={formData.company}
            companies={companies}
            onChange={handleInputChange}
          />

          <SubmitSection />
        </form>

        <FooterLinksSection />
      </main>
    </div>
  );
}