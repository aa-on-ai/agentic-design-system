'use client'

import React from 'react'
import {
  PawPrint,
  Users,
  CalendarDays,
  DollarSign,
  MapPin,
  Clock3,
  Star,
  Bell,
  Search,
  Menu,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Dog,
} from 'lucide-react'

export default function PawprintAdminDashboard() {
  const stats = [
    {
      label: 'Today’s Walks',
      value: '48',
      change: '+12%',
      icon: CalendarDays,
      color: 'bg-emerald-500',
    },
    {
      label: 'Active Walkers',
      value: '18',
      change: '+3',
      icon: Users,
      color: 'bg-sky-500',
    },
    {
      label: 'Monthly Revenue',
      value: '$12,840',
      change: '+8.4%',
      icon: DollarSign,
      color: 'bg-violet-500',
    },
    {
      label: 'Avg. Rating',
      value: '4.9',
      change: '+0.2',
      icon: Star,
      color: 'bg-amber-500',
    },
  ]

  const upcomingWalks = [
    {
      dog: 'Milo',
      owner: 'Sophia Carter',
      walker: 'Emily R.',
      time: '9:00 AM',
      duration: '30 min',
      location: 'Brooklyn Heights',
      status: 'Checked in',
    },
    {
      dog: 'Luna',
      owner: 'James Hall',
      walker: 'Marcus T.',
      time: '10:30 AM',
      duration: '60 min',
      location: 'Williamsburg',
      status: 'Scheduled',
    },
    {
      dog: 'Charlie',
      owner: 'Ava Johnson',
      walker: 'Nina P.',
      time: '11:15 AM',
      duration: '45 min',
      location: 'Park Slope',
      status: 'In progress',
    },
    {
      dog: 'Daisy',
      owner: 'Noah Lee',
      walker: 'Jordan K.',
      time: '1:00 PM',
      duration: '30 min',
      location: 'Cobble Hill',
      status: 'Scheduled',
    },
  ]

  const walkers = [
    { name: 'Emily Rivera', walks: 8, rating: 5.0, area: 'Brooklyn Heights', status: 'On route' },
    { name: 'Marcus Taylor', walks: 6, rating: 4.9, area: 'Williamsburg', status: 'Available' },
    { name: 'Nina Patel', walks: 7, rating: 4.8, area: 'Park Slope', status: 'Walking' },
    { name: 'Jordan Kim', walks: 5, rating: 4.9, area: 'Cobble Hill', status: 'Break' },
  ]

  const alerts = [
    { title: 'Late check-in detected', detail: 'Walker for Bella is 12 minutes behind schedule.', tone: 'warning' },
    { title: 'New premium booking', detail: '2-hour adventure walk booked for Rocky tomorrow.', tone: 'success' },
    { title: 'Owner review received', detail: 'Luna received a 5-star walk summary review.', tone: 'success' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'Checked in' || status === 'Available' || status === 'success') {
      return 'bg-emerald-100 text-emerald-700'
    }
    if (status === 'In progress' || status === 'Walking' || status === 'On route') {
      return 'bg-sky-100 text-sky-700'
    }
    if (status === 'Break') {
      return 'bg-amber-100 text-amber-700'
    }
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Pawprint</h1>
              <p className="text-sm text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {[
              'Overview',
              'Bookings',
              'Walkers',
              'Customers',
              'Dogs',
              'Payments',
              'Reports',
              'Settings',
            ].map((item, index) => (
              <button
                key={item}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  index === 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>

          <div className="m-4 rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-sm text-slate-300">Performance</p>
            <p className="mt-2 text-2xl font-semibold">96% on-time</p>
            <p className="mt-1 text-sm text-slate-400">Walk completion rate this week</p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden">
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Welcome back, Admin</h2>
                    <p className="text-sm text-slate-500">Here’s what’s happening across Pawprint today.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Search bookings, dogs, walkers..."
                    />
                  </div>
                  <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </button>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">
                      A
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium">Alex Morgan</p>
                      <p className="text-xs text-slate-500">Operations Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {stat.change} vs last period
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
            <section className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold">Today’s Walk Schedule</h3>
                    <p className="text-sm text-slate-500">Manage upcoming walks and live statuses.</p>
                  </div>
                  <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                    New Booking
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">Dog</th>
                        <th className="px-5 py-3 font-medium">Owner</th>
                        <th className="px-5 py-3 font-medium">Walker</th>
                        <th className="px-5 py-3 font-medium">Time</th>
                        <th className="px-5 py-3 font-medium">Location</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {upcomingWalks.map((walk) => (
                        <tr key={`${walk.dog}-${walk.time}`} className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Dog className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{walk.dog}</p>
                                <p className="text-sm text-slate-500">{walk.duration}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700">{walk.owner}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{walk.walker}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              {walk.time}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {walk.location}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(walk.status)}`}>
                              {walk.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Live Alerts</h3>
                    <p className="text-sm text-slate-500">Recent operations activity.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    3 new
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.title} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                            alert.tone === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {alert.tone === 'warning' ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{alert.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Walker Status</h3>
                    <p className="text-sm text-slate-500">Current team activity by area.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {walkers.map((walker) => (
                    <div key={walker.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                          {walker.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{walker.name}</p>
                          <p className="text-sm text-slate-500">
                            {walker.walks} walks • {walker.area}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-sm font-medium text-slate-700">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {walker.rating.toFixed(1)}
                        </p>
                        <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(walker.status)}`}>
                          {walker.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
                <p className="text-sm text-slate-300">Quick Summary</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-2xl font-semibold">126</p>
                    <p className="text-sm text-slate-300">Weekly walks booked</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-2xl font-semibold">34</p>
                    <p className="text-sm text-slate-300">New dogs this month</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
