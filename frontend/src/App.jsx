import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import ReviewConfirm from './components/ReviewConfirm';

// Simulated environment variable for local testing, would pull from a secure source typically.
// You must set this to match your deployed Lambda URL!
const API_GATEWAY_URL = 'https://5oxx3na2gk.execute-api.eu-north-1.amazonaws.com/register';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, form, review, success, error

  // Hardcoded test JWT matching the backend exactly (valid 1h based on the script I ran previously).
  // Hardcoded test JWT matching the backend exactly.
  // Hardcoded test JWT matching the backend exactly.
  // In a real app, this would be fetched after a login flow.
  const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xMjMiLCJyb2xlIjoibWVyY2hhbnQiLCJpYXQiOjE3NzE1ODA4MzksImV4cCI6NDkyNTE4MDgzOX0.nSrjja_riUuzB_iKwsh94LEGwT7B83itvJ_JnhaAKN4";

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Shopping',
    ownerName: '',
    phoneNumber: '',
    email: '',
    address: '',
    kycData: '',
    businessLicense: null,
    nrcFront: null
  });

  const [apiResponse, setApiResponse] = useState(null);

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('businessName', formData.businessName);
      data.append('businessType', formData.businessType);
      data.append('ownerName', formData.ownerName);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('email', formData.email);
      data.append('address', formData.address);
      if (formData.kycData) {
        data.append('kycData', JSON.stringify({ additionalInfo: formData.kycData }));
      }

      // Append files
      if (formData.businessLicense) data.append('businessLicense', formData.businessLicense);
      if (formData.nrcFront) data.append('nrcFront', formData.nrcFront);

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        setApiResponse(result);
        setCurrentScreen('success');
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      setApiResponse({ error: err.message });
      setCurrentScreen('error');
    }
  };

  const handleReset = () => {
    setFormData({
      businessName: '', businessType: 'Shopping', ownerName: '',
      phoneNumber: '', email: '', address: '', kycData: '', businessLicense: null, nrcFront: null
    });
    setCurrentScreen('landing');
    setApiResponse(null);
  }

  return (
    <div className="min-h-screen bg-kbz-gray-bg font-sans">

      {currentScreen === 'landing' && (
        <LandingPage onGetStarted={() => setCurrentScreen('form')} />
      )}

      {currentScreen === 'form' && (
        <RegistrationForm
          formData={formData}
          setFormData={setFormData}
          onNext={() => setCurrentScreen('review')}
          onCancel={() => setCurrentScreen('landing')}
        />
      )}

      {currentScreen === 'review' && (
        <ReviewConfirm
          formData={formData}
          onBack={() => setCurrentScreen('form')}
          onSubmit={handleSubmit}
        />
      )}

      {/* Success Modal overlay */}
      {currentScreen === 'success' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-kbz-gray-bg">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-green-100 transform transition-all">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Received!</h2>
            <p className="text-sm text-gray-500 mb-8">Thank you for registering with KBZPay. Your requested documents have been securely uploaded, and we will contact you shortly.</p>

            <button
              onClick={handleReset}
              className="w-full py-4 px-6 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Error Modal overlay */}
      {currentScreen === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-kbz-gray-bg">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Failed</h2>
            <p className="text-sm text-gray-500 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 break-words">{apiResponse?.error || 'Unknown error occurred. Please try again.'}</p>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="w-1/2 py-3.5 px-4 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-semibold rounded-xl shadow-md transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setCurrentScreen('form')}
                className="w-1/2 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Check Form
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
