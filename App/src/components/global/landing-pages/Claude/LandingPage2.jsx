import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Users, Zap, TrendingUp, Star, Check, ArrowRight, Play, X, DollarSign, Clock, BarChart3, CheckCircle, Lock } from 'lucide-react';

const SmartSplitLanding = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    users: 47823,
    tracked: 2847291,
    payments: 892
  });

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        tracked: prev.tracked + Math.floor(Math.random() * 500),
        payments: prev.payments + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager, Stanford University",
      company: "Stanford",
      text: "SmartSplit eliminated payment delays in our research group. The automated follow-ups are professional and effective—we see 90% faster reimbursements."
    },
    {
      name: "Michael Rodriguez",
      role: "Senior Consultant, Deloitte",
      company: "Deloitte",
      text: "Managing team expenses became effortless. The dynamic pricing ensures fairness while the automation saves hours of manual follow-up work."
    },
    {
      name: "Emma Thompson",
      role: "Operations Director, WeWork",
      company: "WeWork",
      text: "Implemented for our coworking community expenses. Zero payment disputes since launch—the transparency builds trust among members."
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Intelligent Automation",
      description: "AI-powered follow-up system that maintains professional relationships while ensuring timely payments. 87% improvement in collection rates.",
      metrics: "87% faster collection"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dynamic Pricing Engine",
      description: "Fair pricing model that rewards prompt payment and covers processing costs for delays. Transparent calculations build trust.",
      metrics: "100% payment transparency"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption, SOC 2 Type II compliance, and zero payment data storage. Your financial information stays protected.",
      metrics: "256-bit SSL encryption"
    }
  ];

  const securityBadges = [
    { name: "SOC 2 Type II", icon: <CheckCircle className="w-8 h-8" /> },
    { name: "256-bit SSL", icon: <Lock className="w-8 h-8" /> },
    { name: "PCI DSS", icon: <Shield className="w-8 h-8" /> },
    { name: "GDPR Compliant", icon: <Users className="w-8 h-8" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold" style={{ color: 'rgb(37, 99, 235)' }}>SmartSplit</div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#security" className="text-gray-600 hover:text-gray-900">Security</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <button 
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trusted by 47,000+ users managing $12M+ in expenses
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stop Being the Person Who
              <br />
              <span style={{ color: 'rgb(37, 99, 235)' }}>Always Pays and Never Gets Paid Back</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              You're tired of being the "responsible one" who covers group expenses, then spends weeks chasing people for money. 
              The awkward texts. The ruined dinners. The strain on relationships you actually care about.
            </p>

            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
              SmartSplit's intelligent automation gets you paid back <strong>3x faster</strong> while preserving the relationships that matter most. 
              No more being the bad guy for wanting your money back.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Stop Chasing People for Money <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> See How It Works
              </button>
            </div>

            {/* Emotional Social Proof */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-12 max-w-3xl mx-auto">
              <p className="text-gray-700 italic mb-3">
                "I used to dread group dinners because I knew I'd end up covering everyone and then feel guilty asking for my money back. 
                SmartSplit handles all of that automatically—I can actually enjoy time with friends again."
              </p>
              <div className="text-sm text-gray-600">
                <strong>Sarah M.</strong> - Product Manager, San Francisco
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{realtimeStats.users.toLocaleString()}+</div>
                <div className="text-gray-600">People Who Stopped Being "The Bank"</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">87%</div>
                <div className="text-gray-600">Less Relationship Stress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">3x</div>
                <div className="text-gray-600">Faster Reimbursement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Challenge of Shared Expense Management
            </h2>
            <p className="text-xl text-gray-600">
              Manual follow-ups create tension. Payment delays impact cash flow. 
              Existing solutions track expenses but don't solve collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Current Problems</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Manual follow-ups strain professional relationships</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">No tracking of recurring cost changes</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Complex calculations and poor payment history</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Average 3-week payment delays</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4">SmartSplit Solution</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Automated intelligent follow-ups preserve relationships</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Real-time monitoring with automatic adjustments</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Smart calculations with comprehensive analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Average 3-day payment completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Intelligent Automation for Professional Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced features designed to eliminate manual overhead while maintaining 
              the highest standards of financial transparency and relationship management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="inline-flex items-center text-sm font-medium text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {feature.metrics}
                </div>
              </div>
            ))}
          </div>

          {/* Workflow */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">1</div>
                <h4 className="text-lg font-semibold mb-3">Configure & Deploy</h4>
                <p className="text-gray-600">Set up expense categories, payment rules, and automation preferences in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">2</div>
                <h4 className="text-lg font-semibold mb-3">Intelligent Processing</h4>
                <p className="text-gray-600">AI handles follow-ups, adjusts pricing dynamically, and tracks all interactions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">3</div>
                <h4 className="text-lg font-semibold mb-3">Optimized Results</h4>
                <p className="text-gray-600">Faster payments, reduced conflicts, and comprehensive reporting for insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
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
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-gray-50">
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
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-20 bg-white">
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
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">SmartSplit Product Demo</h3>
              <button onClick={() => setIsVideoOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Product Demo</p>
                <p className="text-sm">See intelligent automation and dynamic pricing in action</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SmartSplit</h3>
              <p className="text-gray-400">Professional expense management with intelligent automation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartSplit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartSplitLanding;