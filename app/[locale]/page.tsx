"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslations } from 'next-intl';

interface PlanConfig {
  name: string;
  maxTickets: number;
  commissionPercent: number;
  fixedFee: number;
  maxEventsPerMonth: number;
  description: string;
}

interface PlansData {
  freemium: PlanConfig;
  pro: PlanConfig;
  enterprise: PlanConfig;
}

export default function HomePage() {
  const t = useTranslations('HomePage');

  const defaultPlans: PlansData = {
    freemium: {
      name: t('pricing.plans.freemium.name'),
      maxTickets: 100,
      commissionPercent: 0,
      fixedFee: 0,
      maxEventsPerMonth: 1,
      description: t('pricing.plans.freemium.description')
    },
    pro: {
      name: t('pricing.plans.pro.name'),
      maxTickets: 10000,
      commissionPercent: 5,
      fixedFee: 0.50,
      maxEventsPerMonth: 10000,
      description: t('pricing.plans.pro.description')
    },
    enterprise: {
      name: t('pricing.plans.enterprise.name'),
      maxTickets: 100000,
      commissionPercent: 0,
      fixedFee: 0,
      maxEventsPerMonth: 100000,
      description: t('pricing.plans.enterprise.description')
    }
  };

  const [plans, setPlans] = useState<PlansData>(defaultPlans);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const docRef = doc(db, "config", "plans");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Merge remote data with local translations if needed, or just use remote
          // For now, we'll assume remote data might override names/descriptions but we want translated defaults
          // If remote data has hardcoded Spanish strings, this might be an issue.
          // Ideally, remote config should only have numbers, and strings should be local.
          // For this refactor, I'll stick to local translations for text.
          const remoteData = docSnap.data() as PlansData;
          setPlans({
            freemium: { ...defaultPlans.freemium, ...remoteData.freemium, description: defaultPlans.freemium.description }, // Keep translated description
            pro: { ...defaultPlans.pro, ...remoteData.pro, description: defaultPlans.pro.description },
            enterprise: { ...defaultPlans.enterprise, ...remoteData.enterprise, description: defaultPlans.enterprise.description }
          });
        }
      } catch (error) {
        console.error("Error loading plans:", error);
      }
    };
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t.rich('hero.title', {
                  span: (chunks) => <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{chunks}</span>
                })}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-center"
                >
                  {t('hero.startFree')}
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-colors text-center"
                >
                  {t('hero.viewDemo')}
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                {t('hero.features')}
              </p>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg"></div>
                    <div className="h-24 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg"></div>
                    <div className="h-24 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎫",
                title: t('features.items.ticketing.title'),
                description: t('features.items.ticketing.description')
              },
              {
                icon: "📊",
                title: t('features.items.analytics.title'),
                description: t('features.items.analytics.description')
              },
              {
                icon: "📱",
                title: t('features.items.qr.title'),
                description: t('features.items.qr.description')
              },
              {
                icon: "✅",
                title: t('features.items.scanner.title'),
                description: t('features.items.scanner.description')
              },
              {
                icon: "💳",
                title: t('features.items.payments.title'),
                description: t('features.items.payments.description')
              },
              {
                icon: "📧",
                title: t('features.items.email.title'),
                description: t('features.items.email.description')
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Freemium Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.freemium.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-500">{plans.freemium.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{t('pricing.plans.freemium.features.tickets', { maxTickets: plans.freemium.maxTickets })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{t('pricing.plans.freemium.features.events', { maxEvents: plans.freemium.maxEventsPerMonth })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{t('pricing.plans.freemium.features.scanner')}</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors">
                {t('pricing.cta.startFree')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-600 rounded-2xl p-8 relative hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {t('pricing.plans.pro.mostPopular')}
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.pro.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plans.pro.commissionPercent}%</span>
                  <span className="text-xl text-gray-600"> + ${plans.pro.fixedFee}</span>
                </div>
                <p className="text-gray-600">{t('pricing.plans.pro.priceLabel')}</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{t('pricing.plans.pro.features.unlimitedEvents')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{t('pricing.plans.pro.features.unlimitedTickets')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{t('pricing.plans.pro.features.stripe')}</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-shadow">
                {t('pricing.cta.startNow')}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.enterprise.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">{t('pricing.plans.enterprise.price')}</div>
                <p className="text-gray-500">{plans.enterprise.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{t('pricing.plans.enterprise.features.whiteLabel')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{t('pricing.plans.enterprise.features.support')}</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors">
                {t('pricing.cta.contactSales')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: t('stats.eventsCreated') },
              { number: "500,000+", label: t('stats.ticketsSold') },
              { number: "98%", label: t('stats.satisfaction') },
              { number: "24/7", label: t('stats.support') },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
