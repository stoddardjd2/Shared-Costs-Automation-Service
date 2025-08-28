import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Shield,
  Users,
  Zap,
  TrendingUp,
  Star,
  Check,
  ArrowRight,
  Play,
  X,
  DollarSign,
  Clock,
  BarChart3,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackCreateAccount } from "../../../../googleAnalytics/googleAnalyticsHelpers";
import ProductDemoModal2 from "../demo/ProductDemoModal2";
import ProductDemoModal from "../demo/ProductDemoModal";
import { demoSlides } from "../demo/slides";
const SmartSplitLanding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    users: 47823,
    tracked: 2847291,
    payments: 892,
  });

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats((prev) => ({
        users: prev.users + Math.floor(Math.random() * 3),
        tracked: prev.tracked + Math.floor(Math.random() * 500),
        payments: prev.payments + Math.floor(Math.random() * 5),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  function handleCreateAccount() {
    navigate("/signup");

    trackCreateAccount(1);
  }

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager, Stanford University",
      company: "Stanford",
      text: "Splitify eliminated payment delays in our research group. The automated follow-ups are professional and effective—we see 90% faster reimbursements.",
    },
    {
      name: "Michael Rodriguez",
      role: "Senior Consultant, Deloitte",
      company: "Deloitte",
      text: "Managing team expenses became effortless. The dynamic pricing ensures fairness while the automation saves hours of manual follow-up work.",
    },
    {
      name: "Emma Thompson",
      role: "Operations Director, WeWork",
      company: "WeWork",
      text: "Implemented for our coworking community expenses. Zero payment disputes since launch—the transparency builds trust among members.",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Intelligent Automation",
      description:
        "AI-powered follow-up system that maintains professional relationships while ensuring timely payments. 87% improvement in collection rates.",
      metrics: "87% faster collection",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dynamic Pricing Engine",
      description:
        "Fair pricing model that rewards prompt payment and covers processing costs for delays. Transparent calculations build trust.",
      metrics: "100% payment transparency",
    },
    // {
    //   icon: <Shield className="w-6 h-6" />,
    //   title: "Enterprise Security",
    //   description:
    //     "Bank-grade encryption, SOC 2 Type II compliance, and zero payment data storage. Your financial information stays protected.",
    //   metrics: "256-bit SSL encryption",
    // },
  ];

  const securityBadges = [
    // { name: "SOC 2 Type II", icon: <CheckCircle className="w-8 h-8" /> },
    { name: "256-bit SSL", icon: <Lock className="w-8 h-8" /> },
    { name: "PCI DSS", icon: <Shield className="w-8 h-8" /> },
    { name: "GDPR Compliant", icon: <Users className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {/* <section className="relative bg-gradient-to-b from-blue-100 to-white pt-16 pb-20"> */}
      <section className="relative bg-gradient-to-b from-white to-blue-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trusted by 47,000+ users managing $12M+ in expenses
            </div>
             */}
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Automated Shared Cost Management
              <br />
              <span style={{ color: "rgb(37, 99, 235)" }}>
                That Actually Works
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automated follow-ups and price tracking do the work for you.
              Escape the burden of being the group manager. Get paid back faster
              with zero manual intervention.
            </p>

            {/* <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automated follow-ups eliminate payment delays while preserving
              relationships and freeing your mind. Get paid back faster with
              zero manual intervention.
            </p> */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                onClick={handleCreateAccount}
              >
                Start Free Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> View Product Demo
              </button>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{realtimeStats.users.toLocaleString()}+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">${(realtimeStats.tracked / 1000).toFixed(0)}K+</div>
                <div className="text-gray-600">Tracked Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">87%</div>
                <div className="text-gray-600">Faster Collections</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Challenges of Shared Cost Management
            </h2>
            <p className="text-xl text-gray-600">
              Manual follow-ups and payment delays create tension. Existing
              tools track expenses but don’t effectively handle collections or
              follow-ups, forcing users to intervene manually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Current Problems
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Manual follow-ups strain relationships
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    No way to track changing recurring costs like utilities,
                    groceries, or subscription increases
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Complex manual calculations and poor payment history
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Ineffective follow-up solutions
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Splitify Solution
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Automated intelligent follow-ups preserve relationships and
                    eliminate manual intervention.
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Smart cost tracking that updates future requests as prices
                    change.
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Smart calculations with comprehensive payment history.
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Friendly text and email reminders that help everyone stay on
                    top of payments.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Intelligent Automation for Professional Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced features designed to eliminate manual overhead while
              maintaining the highest standards of financial transparency and
              relationship management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-center">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="inline-flex items-center text-sm font-medium text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {feature.metrics}
                </div>
              </div>
            ))}
          </div> */}

          {/* Workflow */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How it Works
            </h2>
          </div>
          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-3">Send Request</h4>
                <p className="text-gray-600">
                  Set up costs, rules, and automation preferences in seconds
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-3">
                  Intelligent Processing
                </h4>
                <p className="text-gray-600">
                  Our system handles follow-ups, keeps up with changing costs,
                  and tracks all interactions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-3">Get Paid</h4>
                <p className="text-gray-600">
                  Get paid directly to Venmo, Cash App, or your preferred method
                  — all saved in your payment history{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Organizations</h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 from 12,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-semibold text-gray-600">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm font-medium text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Security Section */}
      {/* <section id="security" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Enterprise-Grade Security</h2>
          <p className="text-xl text-gray-600 mb-12">
            Your financial data is protected by the same security standards used by major financial institutions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {securityBadges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-green-600 mb-3">{badge.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-gray-700 text-lg leading-relaxed">
              We never store payment information. All transactions are processed through encrypted, 
              verified channels with continuous security monitoring. Your data is protected by 
              256-bit SSL encryption and regular third-party security audits.
            </p>
          </div>
        </div>
      </section> */}

      {/* Pricing CTA */}
      {/* <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start Optimizing Your Expense Management
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of organizations that have eliminated payment delays and reduced administrative overhead.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                Free Trial
                <span className="text-xl text-gray-500 ml-2">30 days</span>
              </div>
              <div className="text-gray-600">Then $4.99/month per user • No setup fees</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Unlimited expense tracking</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Intelligent automation</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Dynamic pricing engine</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>

          <button 
            style={{ backgroundColor: 'rgb(37, 99, 235)' }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-all shadow-lg mb-4 flex items-center justify-center gap-3 mx-auto"
          >
            <Clock className="w-6 h-6" />
            Start Free Trial
          </button>
          
          <p className="text-sm text-gray-500">
            No credit card required • 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </section> */}

      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start Automating Your Shared Cost Management
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Free yourself of the burden of being the group manager.
          </p>

          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                Create Free Account
                {/* <span className="text-xl text-gray-500 ml-2">30 days</span> */}
              </div>
              <div className="text-gray-600">
                {/* Then $4.99/month per user • No setup fees */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Unlimited payment requests</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Text and email follow-ups</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Automatic price tracking</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Optional bank integration</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Comprehensive payment history</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Free to use</span>
              </div>
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-all shadow-lg mb-4 flex items-center justify-center gap-3 mx-auto"
            onClick={handleCreateAccount}
          >
            {/* <Clock className="w-6 h-6" /> */}
            Create Free Account
          </button>

          {/* <p className="text-sm text-gray-500">
            No credit card required • 30-day money-back guarantee • Cancel
            anytime
          </p> */}
        </div>
      </section>

      {/* <ProductDemoModal2
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        slides={demoSlides}
        autoplayMs={5000}
        showThumbnails
      /> */}

      {/* <ProductDemoModal /> */}
      {/* Video Modal */}
      {/* {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Splitify Product Demo</h3>
              <button onClick={() => setIsVideoOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Product Demo</p>
                <p className="text-sm">
                  See intelligent automation and dynamic pricing in action
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SmartSplitLanding;
