import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is ResourceHub?',
    answer: 'ResourceHub is a platform where users can discover, share, and discuss valuable resources across various categories including AI tools, videos, articles, and more.',
  },
  {
    question: 'How do I submit a resource?',
    answer: 'To submit a resource, you need to create an account and log in. Then, visit your dashboard and click on the "Add Resource" button. Fill in the required information about your resource, and submit it for review.',
  },
  {
    question: 'How long does the review process take?',
    answer: 'Our team typically reviews submissions within 24-48 hours. Once approved, your resource will be visible to all users on the platform.',
  },
  {
    question: 'Can I edit my submitted resources?',
    answer: 'Yes, you can edit your submitted resources through your dashboard. However, major changes may require another review process.',
  },
  {
    question: 'How does the rating system work?',
    answer: 'Users can rate resources on a scale of 1-5 stars and leave comments. The overall rating is an average of all user ratings.',
  },
  {
    question: 'Is ResourceHub free to use?',
    answer: 'Yes, ResourceHub is completely free to use. You can browse, submit resources, and participate in discussions without any cost.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600">
          Find answers to common questions about ResourceHub.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-lg font-medium text-gray-900">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-gray-50">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}