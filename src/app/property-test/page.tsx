import Section from '@/components/layout/Section';
import PropertyQuiz from '@/components/utils/PorpertyQuiz';

export default function PropertyTestPage() {
  return (
    <Section>
      <h1 className="text-2xl font-bold mb-6">Find Your Ideal Property</h1>
      <PropertyQuiz />
    </Section>
  );
}
