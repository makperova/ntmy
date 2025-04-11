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

  return (
    <div className="mt-8">
      <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold mb-8`}>Card Preview</h2>
      
      <div>
        <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-medium mb-6`}>Choose Theme</h3>
        
        <div className={`${isMobile ? 'flex-wrap justify-center' : ''} flex mb-8 gap-4`}>
          <button
            className={`${isMobile ? 'w-[110px] h-16' : 'w-36 h-20'} flex items-center justify-center rounded-lg border-2 ${
              selectedTemplate === 'minimal' 
                ? 'border-black' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('minimal')}
          >
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium`}>Minimal</span>
          </button>
          
          <button
            className={`${isMobile ? 'w-[110px] h-16' : 'w-36 h-20'} flex items-center justify-center rounded-lg border-2 bg-gradient-to-r from-blue-400 to-purple-500 ${
              selectedTemplate === 'gradient' 
                ? 'border-black' 
                : 'border-transparent hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('gradient')}
          >
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-white`}>Gradient</span>
          </button>
          
          <button
            className={`${isMobile ? 'w-[110px] h-16' : 'w-36 h-20'} flex items-center justify-center rounded-lg border-2 bg-gray-900 ${
              selectedTemplate === 'dark' 
                ? 'border-black' 
                : 'border-transparent hover:border-gray-400'
            }`}
            onClick={() => onTemplateSelect('dark')}
          >
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-white`}>Dark</span>
          </button>
        </div>
        
        {/* Phone Preview */}
        <div className="mx-auto max-w-md">
          <div className={`rounded-[40px] bg-gray-900 p-3 shadow-xl ${isMobile ? 'transform scale-90' : ''}`}>
            {/* Phone Frame */}
            <div className="relative rounded-[32px] overflow-hidden bg-white">
              {/* Status Bar */}
              <div className="h-12 bg-gray-900 flex items-center justify-between px-6">
                <div className="text-white text-sm">9:41</div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" className="text-white">
                      <path fill="currentColor" d="M12 21.5c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z"/>
                    </svg>
                  </div>
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" className="text-white">
                      <path fill="currentColor" d="M2 22h20V2H2v20zm2-2V4h16v16H4z"/>
                    </svg>
                  </div>
                  <div className="text-white">100%</div>
                </div>
              </div>

              {/* Card Preview Content */}
              <div className="h-[600px] overflow-y-auto">
                {selectedTemplate === 'minimal' && (
                  <div className="bg-white min-h-full">
                    <div className="p-6 space-y-6">
                      {/* Profile Image */}
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
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
                        <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'Your Name'}</h1>
                        {formData.jobTitle && <p className="text-gray-600">{formData.jobTitle}</p>}
                        {formData.company && <p className="text-gray-600">{formData.company}</p>}
                      </div>

                      {/* Bio */}
                      {formData.bio && (
                        <p className="text-gray-600 text-center">{formData.bio}</p>
                      )}

                      {/* Contact Links */}
                      <div className="space-y-3">
                        {formData.email && (
                          <a href={`mailto:${formData.email}`} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Email</span>
                            <span className="ml-auto text-gray-900">{formData.email}</span>
                          </a>
                        )}
                        {formData.phone && (
                          <a href={`tel:${formData.phone}`} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Phone</span>
                            <span className="ml-auto text-gray-900">{formData.phone}</span>
                          </a>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-4">
                        {formData.linkedin && (
                          <a href="#" className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-bold">in</span>
                          </a>
                        )}
                        {formData.telegram && (
                          <a href="#" className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-bold">T</span>
                          </a>
                        )}
                        {formData.whatsapp && (
                          <a href="#" className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-800 font-bold">W</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'gradient' && (
                  <div className="min-h-full bg-gradient-to-b from-blue-500 to-purple-600 text-white">
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
                  <div className="min-h-full bg-gray-900 text-gray-100">
                    <div className="p-6 space-y-6">
                      {/* Profile Image */}
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 ring-2 ring-gray-700">
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
                        <h1 className="text-2xl font-bold">{formData.name || 'Your Name'}</h1>
                        {formData.jobTitle && <p className="text-gray-400">{formData.jobTitle}</p>}
                        {formData.company && <p className="text-gray-400">{formData.company}</p>}
                      </div>

                      {/* Bio */}
                      {formData.bio && (
                        <p className="text-gray-400 text-center">{formData.bio}</p>
                      )}

                      {/* Contact Links */}
                      <div className="space-y-3">
                        {formData.email && (
                          <a href="#" className="flex items-center p-3 bg-gray-800 rounded-lg">
                            <span className="text-gray-400">Email</span>
                            <span className="ml-auto text-gray-200">{formData.email}</span>
                          </a>
                        )}
                        {formData.phone && (
                          <a href="#" className="flex items-center p-3 bg-gray-800 rounded-lg">
                            <span className="text-gray-400">Phone</span>
                            <span className="ml-auto text-gray-200">{formData.phone}</span>
                          </a>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-4">
                        {formData.linkedin && (
                          <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 font-bold">in</span>
                          </a>
                        )}
                        {formData.telegram && (
                          <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 font-bold">T</span>
                          </a>
                        )}
                        {formData.whatsapp && (
                          <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-green-400 font-bold">W</span>
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
    </div>
  );
};

export default TemplateSelector; 