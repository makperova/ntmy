import React, { useState, useEffect } from 'react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
  formData: {
    name: string;
    jobTitle?: string;
    company?: string;
    bio?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    telegram?: string;
    whatsapp?: string;
  };
  previewImage?: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  formData,
  previewImage
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Styles with Inter font family applied inline
  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <div className="mt-8 flex flex-col items-center">
      {/* Import Inter font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <h2 className="text-xl font-bold mb-6 self-start">Card Preview</h2>
      
      <div className="w-full text-center">
        <h3 className="font-medium mb-4">Choose Theme</h3>
        
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`w-[110px] h-16 flex items-center justify-center rounded-lg border-2 ${
              selectedTemplate === 'minimal' 
                ? 'border-black' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('minimal')}
          >
            <span className="text-lg font-medium">Minimal</span>
          </button>
          
          <button
            className={`w-[110px] h-16 flex items-center justify-center rounded-lg border-2 bg-gradient-to-r from-blue-400 to-purple-500 ${
              selectedTemplate === 'gradient' 
                ? 'border-black' 
                : 'border-transparent hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('gradient')}
          >
            <span className="text-lg font-medium text-white">Gradient</span>
          </button>
          
          <button
            className={`w-[110px] h-16 flex items-center justify-center rounded-lg border-2 bg-gray-900 ${
              selectedTemplate === 'dark' 
                ? 'border-black' 
                : 'border-transparent hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('dark')}
          >
            <span className="text-lg font-medium text-white">Dark</span>
          </button>
        </div>
        
        {/* Card Preview */}
        <div className="mx-auto" style={{ maxWidth: '320px' }}>
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Card Preview Content */}
            <div className="h-[500px] overflow-y-auto">
              {selectedTemplate === 'minimal' && (
                <div className="bg-white min-h-full" style={interStyle}>
                  <div className="pt-8 pb-6 px-6 space-y-8">
                    {/* Profile Image */}
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="text-center space-y-2">
                      <h1 style={{ fontSize: '30px', fontWeight: 600, color: 'black' }} className="font-semibold">
                        {formData.name || 'Your Name'}
                      </h1>
                      <div style={{ color: '#5E5E5E' }}>
                        {formData.jobTitle && <p style={{ fontSize: '14px', fontWeight: 400 }}>{formData.jobTitle}</p>}
                        {formData.company && <p style={{ fontSize: '14px', fontWeight: 400 }}>{formData.company}</p>}
                      </div>
                    </div>

                    {/* Bio */}
                    {formData.bio && (
                      <p style={{ fontSize: '16px', fontWeight: 400, color: 'black' }} className="text-center leading-relaxed">
                        {formData.bio}
                      </p>
                    )}

                    {/* Contact Links */}
                    <div className="space-y-3">
                      {formData.email && (
                        <a href={`mailto:${formData.email}`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-gray-500">Email</span>
                          <span className="ml-auto text-gray-900 font-medium">{formData.email}</span>
                        </a>
                      )}
                      {formData.phone && (
                        <a href={`tel:${formData.phone}`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-gray-500">Phone</span>
                          <span className="ml-auto text-gray-900 font-medium">{formData.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-6">
                      {formData.linkedin && (
                        <a href="#" className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold">in</span>
                        </a>
                      )}
                      {formData.telegram && (
                        <a href="#" className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold">T</span>
                        </a>
                      )}
                      {formData.whatsapp && (
                        <a href="#" className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold">W</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'gradient' && (
                <div className="min-h-full bg-gradient-to-b from-blue-500 to-purple-600 text-white" style={interStyle}>
                  <div className="p-6 space-y-6">
                    {/* Profile Image */}
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/30">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="text-center space-y-2">
                      <h1 className="text-2xl font-bold">{formData.name || 'Your Name'}</h1>
                      {formData.jobTitle && <p className="text-white/80">{formData.jobTitle}</p>}
                      {formData.company && <p className="text-white/80">{formData.company}</p>}
                    </div>

                    {/* Bio */}
                    {formData.bio && (
                      <p className="text-white/80 text-center">{formData.bio}</p>
                    )}

                    {/* Contact Links */}
                    <div className="space-y-3">
                      {formData.email && (
                        <a href="#" className="flex items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                          <span className="text-white/80">Email</span>
                          <span className="ml-auto">{formData.email}</span>
                        </a>
                      )}
                      {formData.phone && (
                        <a href="#" className="flex items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                          <span className="text-white/80">Phone</span>
                          <span className="ml-auto">{formData.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      {formData.linkedin && (
                        <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold">in</span>
                        </a>
                      )}
                      {formData.telegram && (
                        <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold">T</span>
                        </a>
                      )}
                      {formData.whatsapp && (
                        <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold">W</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'dark' && (
                <div className="min-h-full bg-black text-white" style={interStyle}>
                  <div className="pt-8 pb-6 px-6 space-y-8">
                    {/* Profile Image */}
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="text-center space-y-2">
                      <h1 style={{ fontSize: '30px', fontWeight: 600 }} className="font-semibold text-white">
                        {formData.name || 'Your Name'}
                      </h1>
                      <div className="text-gray-400">
                        {formData.jobTitle && <p style={{ fontSize: '16px', fontWeight: 400 }}>{formData.jobTitle}</p>}
                        {formData.company && <p style={{ fontSize: '16px', fontWeight: 400 }}>{formData.company}</p>}
                      </div>
                    </div>

                    {/* Bio */}
                    {formData.bio && (
                      <p style={{ fontSize: '16px', fontWeight: 400 }} className="text-white text-center leading-relaxed">
                        {formData.bio}
                      </p>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center space-x-6 pt-4">
                      {formData.linkedin && (
                        <a href="#" className="w-12 h-12 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M26.5 4.5H5.5C4.94772 4.5 4.5 4.94772 4.5 5.5V26.5C4.5 27.0523 4.94772 27.5 5.5 27.5H26.5C27.0523 27.5 27.5 27.0523 27.5 26.5V5.5C27.5 4.94772 27.0523 4.5 26.5 4.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 14V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 10V10.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 22V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 14V14.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 22V16C22 15.4696 21.7893 14.9609 21.4142 14.5858C21.0391 14.2107 20.5304 14 20 14C19.4696 14 18.9609 14.2107 18.5858 14.5858C18.2107 14.9609 18 15.4696 18 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                      {formData.telegram && (
                        <a href="#" className="w-12 h-12 flex items-center justify-center">
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M27 9L16.5 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M27 9L19.5 28.5L16.5 19.5L7.5 16.5L27 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                      {formData.whatsapp && (
                        <a href="#" className="w-12 h-12 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 18.5264 4.70577 20.8773 5.91713 22.8581L4.5 28L9.76134 26.6183C11.6783 27.7276 13.7618 28.3636 16 28Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 18.8C20.5 20 19.5 21 18 21.5C17 21.8 15.5 22 13.7 21.1C11.9 20.2 10.1 18.3 9.1 16.8C8 15 8 13.5 8.3 12.5C8.6 11.5 9.6 10.5 10.7 9.89998" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.4 14.9C18.4 14.9 17.1 12.7 15.5 11.3C13.9 9.90002 12.4 9.60001 11.7 10C11 10.4 10.6 11.5 10.6 12.5C10.6 13.5 10.9 14.6 11.4 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.1 21.8C15.3 22.4 16.9 22.2 18.5 21.4C20.1 20.6 22.5 17.3 22.5 14.6C22.5 11.9 21.2 10.5 20.2 10.2C19.2 9.9 17.4 10.4 16.7 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                      {!formData.whatsapp && (
                        <a href="#" className="w-12 h-12 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.837 32 32 24.837 32 16C32 7.163 24.837 0 16 0ZM11.4822 7.2361C12.0753 7.20654 12.2644 7.2 13.334 7.2H13.3356C14.4051 7.2 14.5929 7.20654 15.186 7.2361C15.7791 7.26547 16.1749 7.35547 16.5251 7.48908C16.888 7.62685 17.2018 7.81474 17.5156 8.12854C17.8293 8.44253 18.0171 8.75614 18.155 9.11893C18.2886 9.46912 18.3786 9.86474 18.4079 10.4579C18.4374 11.051 18.444 11.2401 18.444 12.3097V12.3113C18.444 13.3809 18.4374 13.5687 18.4079 14.1618C18.3783 14.7549 18.2883 15.1507 18.155 15.5009C18.0171 15.8638 17.8294 16.1776 17.5156 16.4913C17.2018 16.8051 16.888 16.993 16.5251 17.1309C16.1749 17.2645 15.7791 17.3545 15.186 17.3838C14.5929 17.4133 14.4037 17.42 13.334 17.42H13.3324C12.2628 17.42 12.075 17.4133 11.4819 17.3838C10.8888 17.3542 10.493 17.2642 10.1429 17.1309C9.78007 16.993 9.46627 16.8051 9.1525 16.4913C8.83872 16.1775 8.65083 15.8637 8.51287 15.5008C8.37927 15.1507 8.28927 14.7549 8.26 14.1618C8.23045 13.5687 8.224 13.3809 8.224 12.3113V12.3097C8.224 11.2401 8.23045 11.0509 8.26 10.4578C8.28937 9.86474 8.37927 9.46912 8.51287 9.11893C8.65083 8.75595 8.83872 8.44234 9.1525 8.12854C9.46627 7.81474 9.78007 7.62685 10.1429 7.48908C10.493 7.35547 10.8888 7.26547 11.4819 7.2361H11.4822ZM13.3348 8.52C12.2793 8.52 12.1049 8.52587 11.5184 8.55523C10.9787 8.58265 10.6828 8.66879 10.4824 8.7415C10.2153 8.83706 10.0209 8.95131 9.81546 9.15694C9.60984 9.36256 9.4954 9.55676 9.40003 9.82393C9.32732 10.0242 9.24099 10.3203 9.21357 10.86C9.18422 11.4465 9.17834 11.621 9.17834 12.6764V12.678C9.17834 13.7335 9.18422 13.908 9.21357 14.4944C9.24099 15.0342 9.32713 15.3301 9.40003 15.5305C9.4956 15.7976 9.60984 15.992 9.81546 16.1975C10.0211 16.4031 10.2153 16.5175 10.4824 16.6129C10.6828 16.6856 10.9787 16.7719 11.5184 16.7993C12.105 16.8287 12.2794 16.8346 13.3348 16.8346H13.3364C14.3919 16.8346 14.5664 16.8287 15.1528 16.7993C15.6926 16.7719 15.9885 16.6858 16.1889 16.6129C16.4559 16.5173 16.6501 16.4031 16.8558 16.1975C17.0614 15.9918 17.1758 15.7976 17.2712 15.5305C17.3439 15.3301 17.4303 15.0342 17.4577 14.4944C17.487 13.908 17.493 13.7335 17.493 12.678V12.6764C17.493 11.621 17.487 11.4465 17.4577 10.86C17.4303 10.3203 17.3441 10.0244 17.2712 9.82393C17.1756 9.55676 17.0614 9.36256 16.8558 9.15694C16.6501 8.95131 16.4559 8.83687 16.1889 8.7415C15.9885 8.66879 15.6926 8.58246 15.1528 8.55523C14.5664 8.52587 14.3919 8.52 13.3364 8.52H13.3348ZM13.3356 9.67852C14.3616 9.67852 14.5227 9.68362 15.0981 9.7126C15.6291 9.73945 15.8521 9.82203 16.0014 9.89187C16.1987 9.98357 16.3399 10.094 16.4884 10.2425C16.6369 10.391 16.7473 10.5322 16.839 10.7296C16.9088 10.8788 16.9914 11.1018 17.0183 11.6328C17.0472 12.2082 17.0523 12.3694 17.0523 13.3954C17.0523 14.4214 17.0472 14.5825 17.0183 15.1579C16.9914 15.6889 16.9088 15.9119 16.839 16.0612C16.7473 16.2585 16.6369 16.3997 16.4884 16.5482C16.3399 16.6967 16.1987 16.8071 16.0014 16.8988C15.8522 16.9686 15.6291 17.0512 15.0981 17.0781C14.5229 17.1071 14.3616 17.1122 13.3356 17.1122C12.3095 17.1122 12.1484 17.1071 11.5732 17.0781C11.0422 17.0512 10.8192 16.9686 10.6699 16.8988C10.4726 16.8071 10.3313 16.6967 10.1829 16.5482C10.0344 16.3997 9.92391 16.2585 9.83221 16.0612C9.76237 15.9119 9.67979 15.6889 9.65294 15.1579C9.62396 14.5825 9.61886 14.4214 9.61886 13.3954C9.61886 12.3694 9.62396 12.2082 9.65294 11.6328C9.67979 11.1018 9.76237 10.8788 9.83221 10.7296C9.92391 10.5322 10.0343 10.391 10.1828 10.2425C10.3313 10.094 10.4725 9.98357 10.6699 9.89187C10.819 9.82203 11.0421 9.73945 11.573 9.7126C12.1484 9.68362 12.3096 9.67852 13.3356 9.67852ZM13.3356 10.3965C12.3467 10.3965 11.5441 11.1992 11.5441 12.188C11.5441 13.1769 12.3467 13.9795 13.3356 13.9795C14.3245 13.9795 15.1271 13.1769 15.1271 12.188C15.1271 11.1992 14.3245 10.3965 13.3356 10.3965ZM13.3356 11.716C13.6043 11.716 13.8621 11.8233 14.0527 12.014C14.2434 12.2046 14.3507 12.4624 14.3507 12.7311C14.3507 12.9998 14.2434 13.2576 14.0527 13.4483C13.8621 13.6389 13.6043 13.7462 13.3356 13.7462C13.0669 13.7462 12.8091 13.6389 12.6185 13.4483C12.4279 13.2576 12.3205 12.9998 12.3205 12.7311C12.3205 12.4624 12.4279 12.2046 12.6185 12.014C12.8091 11.8233 13.0669 11.716 13.3356 11.716ZM15.3141 10.2693C15.3141 10.2693 15.3142 10.2693 15.3142 10.2693C15.4233 10.2693 15.5279 10.3123 15.6053 10.3896C15.6826 10.467 15.7256 10.5715 15.7256 10.6807C15.7256 10.7899 15.6826 10.8944 15.6053 10.9718C15.5279 11.0491 15.4234 11.0921 15.3142 11.0921C15.205 11.0921 15.1004 11.0491 15.0231 10.9718C14.9458 10.8944 14.9028 10.7899 14.9028 10.6807C14.9028 10.5715 14.9458 10.467 15.0231 10.3896C15.1004 10.3124 15.2048 10.2694 15.3141 10.2693Z" fill="white"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 