import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Users, Zap, TrendingUp, Star, Check, ArrowRight, Play, X, DollarSign, Clock, Heart, Brain, RefreshCw, UserMinus } from 'lucide-react';

const SmartSplitLanding = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState({
    trapped: 47823,
    freed: 12847,
    relationships: 3291
  });

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        trapped: prev.trapped + Math.floor(Math.random() * 2),
        freed: prev.freed + Math.floor(Math.random() * 4),
        relationships: prev.relationships + Math.floor(Math.random() * 3)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Former Group Coordinator",
      text: "I was trapped as the 'money person' for 3 years. The constant stress of chasing payments was destroying my friendships. SmartSplit finally freed me from that role.",
      impact: "Reduced coordination stress by 89%"
    },
    {
      name: "Michael Rodriguez", 
      role: "Roommate Coordinator",
      text: "I used to spend 2 hours every week managing who owed what and following up. The emotional exhaustion was overwhelming. Now it's completely automated.",
      impact: "Eliminated 8+ hours monthly admin work"
    },
    {
      name: "Emma Thompson",
      role: "Family Organizer",
      text: "Being the family 'accountant' was ruining every gathering. I dreaded events because I knew I'd have to handle money. SmartSplit gave me my relationships back.",
      impact: "Restored enjoyment in 95% of family events"
    }
  ];

  const painPoints = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "The Coordinator Trap",
      description: "Once you handle group expenses once, you become the permanent 'money person' - a role that's impossible to escape without damaging relationships.",
      consequence: "87% report feeling trapped in coordination roles for 2+ years"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Emotional Labor Burnout",
      description: "Managing everyone's financial comfort while suppressing your own frustration creates exhausting 'emotional dissonance' that damages mental health.",
      consequence: "Coordinators experience 3x higher financial anxiety than group members"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Relationship Poison",
      description: "Repeatedly asking friends and family for money creates social anxiety and transforms caring relationships into transactional interactions.",
      consequence: "Financial conflicts are 4x more persistent than other relationship disputes"
    }
  ];

  const solutions = [
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Automatic Role Rotation",
      description: "Break the coordinator trap with mandatory rotation that distributes the emotional labor across all group members.",
      benefit: "No one person bears the burden permanently"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Relationship-Preserving Automation",
      description: "Intelligent communication that handles follow-ups without making you the 'bad guy' asking for money repeatedly.",
      benefit: "Preserve friendships while ensuring fairness"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Emotional Labor Recognition",
      description: "Visible appreciation for coordination work and systems that make everyone accountable for their financial contributions.",
      benefit: "Recognition for invisible work you've been doing"
    }

    
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
              <a href="#escape" className="text-gray-600 hover:text-gray-900">Break Free</a>
              <a href="#solutions" className="text-gray-600 hover:text-gray-900">Solutions</a>
              <a href="#stories" className="text-gray-600 hover:text-gray-900">Stories</a>
              <button 
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Escape the Trap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-50 to-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <UserMinus className="w-4 h-4 mr-2" />
              47,000+ people trapped as permanent expense coordinators
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Trapped as the
              <br />
              <span className="text-red-600">"Money Person"</span> Forever?
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              You didn't volunteer to become the permanent group accountant. But now you're stuck managing everyone's finances, 
              chasing payments, and being the "bad guy" when money gets awkward.
            </p>

            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
              The psychological research is clear: <strong>being the expense coordinator creates systematic emotional labor, 
              social anxiety, and relationship damage</strong> that no app has ever addressed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Break Free from Coordination Trap <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Why Coordinators Burn Out
              </button>
            </div>

            {/* Emotional Social Proof */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-12 max-w-3xl mx-auto">
              <p className="text-gray-700 italic mb-3">
                "I was trapped as the group coordinator for 4 years. The constant stress of managing everyone's money 
                while trying to preserve friendships was exhausting. I started avoiding group activities just to escape the burden."
              </p>
              <div className="text-sm text-gray-600">
                <strong>Rachel K.</strong> - Former Roommate Coordinator, Boston
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{realtimeStats.trapped.toLocaleString()}+</div>
                <div className="text-gray-600">People Trapped as Coordinators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{realtimeStats.freed.toLocaleString()}+</div>
                <div className="text-gray-600">Freed from Coordination Burden</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{realtimeStats.relationships.toLocaleString()}+</div>
                <div className="text-gray-600">Relationships Preserved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="escape" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Hidden Psychology of Coordination Burden
            </h2>
            <p className="text-xl text-gray-600">
              Research reveals why certain people become permanently trapped in expense coordination roles, 
              and the devastating emotional costs they bear.
            </p>
          </div>

          <div className="space-y-8">
            {painPoints.map((point, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border-l-4 border-red-500">
                <div className="flex items-start gap-6">
                  <div className="text-red-600 flex-shrink-0">{point.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{point.title}</h3>
                    <p className="text-gray-700 mb-4 text-lg">{point.description}</p>
                    <div className="inline-flex items-center text-red-600 font-semibold">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {point.consequence}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">The Research is Clear:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <span><strong>87% of coordinators</strong> feel trapped in their role for 2+ years with no escape</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <span><strong>73% experience emotional exhaustion</strong> from constant money management</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <span><strong>Financial conflicts are 4x more persistent</strong> than other relationship disputes</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <span><strong>68% start avoiding group activities</strong> to escape coordination burden</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Break the Coordinator Trap Forever
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SmartSplit is the first expense platform designed around the psychology of coordination burden. 
              We solve the human problem, not just the math problem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">{solution.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                <p className="text-gray-600 mb-4">{solution.description}</p>
                <div className="inline-flex items-center text-sm font-medium text-green-600">
                  <Heart className="w-4 h-4 mr-2" />
                  {solution.benefit}
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-3xl p-8 sm:p-12">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How We Break the Coordination Trap</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                <h4 className="text-xl font-bold mb-3">Distribute the Load</h4>
                <p className="text-gray-600">Automatically rotate coordination responsibilities so no one person bears the permanent burden</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                <h4 className="text-xl font-bold mb-3">Preserve Relationships</h4>
                <p className="text-gray-600">Smart automation handles follow-ups and collection without making anyone the "bad guy"</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                <h4 className="text-xl font-bold mb-3">Restore Enjoyment</h4>
                <p className="text-gray-600">Return to enjoying group activities without the stress and anxiety of financial coordination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Freedom Stories: Life After Coordination</h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 from former coordinators</span>
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
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div className="text-sm font-medium text-green-600 mb-4">{testimonial.impact}</div>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Escape the Coordinator Trap?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands who've broken free from the psychological burden of expense coordination.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-white mb-2">
                FREE
                <span className="text-xl text-blue-200 ml-2">forever</span>
              </div>
              <div className="text-blue-100">For personal use • No coordination burden</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Automatic role rotation</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Relationship-preserving automation</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Emotional labor recognition</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Psychology-based design</span>
              </div>
            </div>
          </div>

          <button 
            style={{ backgroundColor: 'rgb(37, 99, 235)' }}
            className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-all shadow-xl mb-4 flex items-center justify-center gap-3 mx-auto"
          >
            <RefreshCw className="w-6 h-6" />
            Break Free from Coordination Forever
          </button>
          
          <p className="text-sm text-blue-200">
            No more being trapped • No more emotional exhaustion • No more relationship damage
          </p>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">The Psychology of Coordinator Burnout</h3>
              <button onClick={() => setIsVideoOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Research Insights</p>
                <p className="text-sm">Why being the coordinator creates systematic psychological burden</p>
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
              <p className="text-gray-400">Breaking the coordinator trap through psychology-based expense management.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Freedom</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Escape Coordination</a></li>
                <li><a href="#" className="hover:text-white">Preserve Relationships</a></li>
                <li><a href="#" className="hover:text-white">Reduce Stress</a></li>
                <li><a href="#" className="hover:text-white">Recognition</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Research</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Psychology Studies</a></li>
                <li><a href="#" className="hover:text-white">Coordinator Burden</a></li>
                <li><a href="#" className="hover:text-white">Emotional Labor</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartSplit. Breaking coordinator traps everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartSplitLanding;