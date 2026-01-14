import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShaderAnimation } from '@/components/shader-animation';
import { Typewriter } from '@/components/ui/typewriter';
import { Link2, CornerDownLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import floAIAPI from '@/lib/api';
import { useDesignerStore } from '@/store/designerStore';

interface LandingPageProps {
  onStartDesigning: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const LandingPage: React.FC<LandingPageProps> = ({ onStartDesigning }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const importFromYAML = useDesignerStore((state) => state.importFromYAML);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const run = async () => {
      try {
        setStatus('loading');
        setStatusMessage('Generating your AI workflow...');
        
        console.log('📤 Sending prompt to API:', prompt);
        const response = await floAIAPI.generateStudioWorkflow({ prompt });
        console.log('📥 API Response:', response);

        if (response.status === 'success' && (response.data as any)?.yaml) {
          const yamlContent = (response.data as any).yaml as string;
          console.log('📄 Received YAML:', yamlContent.substring(0, 200) + '...');
          
          setStatusMessage('Importing workflow into studio...');
          
          try {
            await importFromYAML(yamlContent);
            setStatus('success');
            setStatusMessage('Workflow created successfully!');
            
            // Small delay to show success message before transitioning
            setTimeout(() => {
              onStartDesigning();
            }, 500);
          } catch (yamlError) {
            console.error('❌ Failed to import YAML:', yamlError);
            setStatus('error');
            setStatusMessage(`Failed to parse workflow: ${yamlError instanceof Error ? yamlError.message : 'Unknown error'}`);
            
            // Still open studio after a delay
            setTimeout(() => {
              onStartDesigning();
            }, 2000);
          }
        } else {
          console.error('❌ API Error:', response.error || response.data);
          setStatus('error');
          setStatusMessage(response.error || 'Failed to generate workflow');
          
          // Open studio anyway after a delay
          setTimeout(() => {
            onStartDesigning();
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Request failed:', error);
        setStatus('error');
        setStatusMessage(error instanceof Error ? error.message : 'Connection failed');
        
        // Open studio anyway after a delay
        setTimeout(() => {
          onStartDesigning();
        }, 2000);
      }
    };

    void run();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ShaderAnimation />
      <div className="relative z-10 w-full max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center space-y-12 px-4">
        {/* Logo + Tagline */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Flo AI Studio
          </h1>
          <Typewriter
            text={[
              'Stop building complex workflows, one prompt is enough',
              'Describe what you want, we build it for you',
              'Create multi-agent AI systems in seconds',
            ]}
            loop
            speed={80}
            deleteSpeed={40}
            delay={1600}
            className="block text-lg md:text-xl font-semibold text-gray-100/90 drop-shadow-md"
          />
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            status === 'loading' ? 'bg-blue-900/50 text-blue-200' :
            status === 'success' ? 'bg-green-900/50 text-green-200' :
            'bg-red-900/50 text-red-200'
          }`}>
            {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-4 h-4" />}
            {status === 'error' && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        {/* Prompt Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <div className="flex items-center gap-4 rounded-3xl bg-neutral-900/90 border border-neutral-700 px-6 py-4 backdrop-blur-sm shadow-2xl">
            {/* Left icons */}
            <div className="flex items-center gap-4 text-neutral-400">
              <button
                type="button"
                onClick={handleFileClick}
                className="hover:text-neutral-200 transition-colors p-1"
                title="Attach files"
              >
                <Link2 className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
            </div>

            {/* Prompt input */}
            <input
              type="text"
              placeholder="Describe your AI workflow... (e.g., 'Create a customer support team')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'loading'}
              className="flex-1 bg-transparent border-0 outline-none text-base text-neutral-100 placeholder:text-neutral-500 disabled:opacity-50"
            />

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={status === 'loading' || !prompt.trim()}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CornerDownLeft className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>

        {/* File attachments */}
        {files.length > 0 && (
          <div className="w-full max-w-3xl text-xs text-neutral-300/80 mt-2">
            {files.length === 1
              ? `1 file attached: ${files[0].name}`
              : `${files.length} files attached`}
          </div>
        )}

        {/* Example prompts */}
        <div className="w-full max-w-3xl">
          <p className="text-xs text-neutral-400 mb-3 text-center">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Create a customer support workflow',
              'Build a content creation pipeline',
              'Design a code review system',
              'Make a research analysis team',
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={status === 'loading'}
                className="px-3 py-1.5 text-xs bg-neutral-800/50 text-neutral-300 rounded-full hover:bg-neutral-700/50 transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
