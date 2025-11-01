import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Brain, Zap, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background dark:from-background dark:via-slate-900/30 dark:to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">InsightFlow</span>
            <span className="text-xs font-semibold text-primary/70 ml-1">AI Hub</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 gradient-text">Transform Data Into Insights</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Upload your data, let AI analyze it, and discover patterns you never knew existed. Statistical analysis,
            correlations, outlier detection, and intelligent insights—all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Statistical Analysis",
                description: "Get comprehensive statistics including mean, median, standard deviation, and more.",
              },
              {
                icon: Zap,
                title: "AI-Powered Insights",
                description: "Ask questions about your data and get intelligent, context-aware answers.",
              },
              {
                icon: Brain,
                title: "Pattern Recognition",
                description: "Automatically detect correlations, outliers, and trends in your datasets.",
              },
            ].map((feature, i) => (
              <div key={i} className="glass-effect p-8 rounded-xl card-hover">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass-effect p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to analyze your data?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of data analysts using InsightFlow to unlock insights.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
