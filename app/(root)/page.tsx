import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

import UploadResumeDialog from "@/components/UploadResumeDialog";
import ScrollReveal from "@/components/ScrollReveal";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <ScrollReveal direction="zoom">
        <section className="card-cta">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
            <p className="text-lg">Prepare an Interview:</p>
            <div className="flex gap-6 max-w-lg">
            <Button asChild className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 max-sm:w-full">
  <Link href="/interview">
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
      Using AI Assistant
    </span>
  </Link>
</Button>
              <p className="pt-2">OR</p>
              <UploadResumeDialog />
            </div>
          </div>

          <Image
            src="/new_robot.png"
            alt="robo-dude"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>
      </ScrollReveal>

      <ScrollReveal direction="zoom">
        <section className="card-sec">
          <div className="flex flex-col gap-8 max-w-lg">
            <h2>Get ATS Score for Your Resume</h2>
            <p className="text-lg">
              Get Suggestions to Improve Your ATS Score
            </p>
            <Button asChild className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 max-sm:w-full">
  <Link href="/ats">
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
      Check ATS Score
    </span>
  </Link>
</Button>

          </div>
          <Image
            src="/ats.png"
            alt="ATS"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>
      </ScrollReveal>

      <ScrollReveal direction="left">
  <section className="flex flex-col gap-8 mt-8">
    <h2>Your Interviews</h2>

    <div className="interviews-section flex flex-wrap gap-12">
      {hasPastInterviews ? (
        userInterviews?.map((interview) => (
          <InterviewCard
            key={interview.id}
            userId={user?.id}
            interviewId={interview.id}
            role={interview.role}
            type={interview.type}
            techstack={interview.techstack}
            createdAt={interview.createdAt}
          />
        ))
      ) : (
        <p>You haven&apos;t taken any interviews yet</p>
      )}
    </div>
  </section>
</ScrollReveal>

<ScrollReveal direction="right">
  <section className="flex flex-col gap-8 mt-12">
    <h2>Take Interviews</h2>

    <div className="interviews-section flex flex-wrap gap-12">
      {hasUpcomingInterviews ? (
        allInterview?.map((interview) => (
          <InterviewCard
            key={interview.id}
            userId={user?.id}
            interviewId={interview.id}
            role={interview.role}
            type={interview.type}
            techstack={interview.techstack}
            createdAt={interview.createdAt}
          />
        ))
      ) : (
        <p>There are no interviews available</p>
      )}
    </div>
  </section>
</ScrollReveal>
    </>
  );
}

export default Home;
