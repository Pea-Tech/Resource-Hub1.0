import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Share2, Shield, Users } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
          Discover & Share
          <span className="text-indigo-600"> Valuable Resources</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Join our community of knowledge seekers and contributors. Find curated resources
          across various categories, from AI tools to educational content.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/explore"
            className="px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start Exploring
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 text-base font-medium rounded-md text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50"
          >
            Join Now
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose ResourceHub?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Discovery</h3>
            <p className="text-gray-600">
              Find exactly what you need with our powerful search and filtering system.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Knowledge</h3>
            <p className="text-gray-600">
              Contribute valuable resources and help others in their learning journey.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
            <p className="text-gray-600">
              All resources are verified by our team to ensure high quality and relevance.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50 rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Start Sharing?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our growing community of contributors and help others discover valuable resources.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Users className="h-5 w-5 mr-2" />
          Join the Community
        </Link>
      </div>
    </div>
  );
}