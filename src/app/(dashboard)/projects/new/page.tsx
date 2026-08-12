import { CreatePitchForm } from '@/components/projects/create-pitch-form';

export const metadata = {
  title: 'Create a New Pitch | JIIT Matchmaker',
};

export default function NewPitchPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create a New Pitch</h1>
        <p className="text-gray-400">Share your project idea and find the right teammates.</p>
      </div>
      <CreatePitchForm />
    </div>
  );
}
