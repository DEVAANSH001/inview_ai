'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function UploadResumeDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false); // <-- Manage dialog open state

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userid', '1234'); // Replace with actual user ID

    try {
      setUploading(true);
      toast.info('Analyzing your resume, please wait...');

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Interview questions generated successfully!');
        console.log('Interview:', data.interview);
        setOpen(false); // close dialog on success
      } else {
        toast.error(data.error || 'Failed to analyze resume.');
      }
    } catch (error) {
      toast.error('Something went wrong while uploading.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
      <Button
  asChild
  className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 max-sm:w-full"
>
  <span>
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
      Your Resume
    </span>
  </span>
</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            We'll extract key details from your resume and generate relevant interview questions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block border rounded p-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-800 file:text-white file:cursor-pointer"
            required
          />
          {file && <CheckCircle className="text-green-500 w-5 h-5" />}
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload & Generate'}
          </Button>
          <Button className=''
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
