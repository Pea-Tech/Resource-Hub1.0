import React from 'react';
import { Users, Target, Shield } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ResourceHub</h1>
        <p className="text-lg text-gray-600">
          We're building the most comprehensive platform for discovering and sharing valuable resources.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600" />
            Our Mission
          </h2>
          <p className="text-gray-600">
            ResourceHub was created with a simple but powerful mission: to make knowledge sharing
            easier and more accessible. We believe that everyone has valuable resources to share,
            and everyone deserves access to quality learning materials.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2 text-indigo-600" />
            What We Do
          </h2>
          <p className="text-gray-600">
            We provide a platform where users can discover, share, and discuss various resources
            across different categories. From AI tools to educational content, our platform
            helps connect people with the resources they need to learn and grow.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-indigo-600" />
            Our Values
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Quality: We ensure all shared resources meet high standards</li>
            <li>Community: We foster a supportive environment for learning</li>
            <li>Accessibility: We make knowledge accessible to everyone</li>
            <li>Innovation: We continuously improve our platform</li>
          </ul>
        </div>
      </div>
    </div>
  );
}