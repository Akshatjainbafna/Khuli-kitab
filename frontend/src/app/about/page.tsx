import type { Metadata } from 'next'
import ProfilePage from '@/components/profile/profile-page'

export const metadata: Metadata = {
  title: 'Akshat Jain · Profile',
  description:
    'Skills, experience, projects, values and what I am looking for, as interactive charts. Senior Software Engineer: full-stack, data-heavy and AI-native products.',
}

export default function AboutPage() {
  return <ProfilePage />
}
