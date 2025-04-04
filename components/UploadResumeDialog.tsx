'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function UploadResumeDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a resume file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userid', '1234'); // Replace with actual user ID if available

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="btn-primary max-sm:w-full">Your Resume</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            We'll extract key details from your resume and generate relevant interview questions.
          </DialogDescription>
        </DialogHeader>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          ref={inputRef}
          className="block w-full mt-4"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload & Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
