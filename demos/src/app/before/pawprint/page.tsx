'use client'

import React from 'react'

export default function PawprintAdminDashboard() {
  const stats = [
    { label: 'Today’s Walks', value: '28', change: '+12%', color: 'bg-emerald-500' },
    { label: 'Active Walkers', value: '14', change: '+3%', color: 'bg-sky-500' },
    { label: 'New Bookings', value: '9', change: '+18%', color: 'bg-violet-500' },
    { label: 'Revenue', value: '$1,240', change: '+9%', color: 'bg-amber-500' },
  ]

  const upcomingWalks = [
    {
      dog: 'Buddy',
      owner: 'Sarah Chen',
      walker: 'Maya Lopez',
      time: '9:00 AM',
      duration: '30 min',
      status: 'Checked in',
    },
    {
      dog: 'Luna',
      owner: 'James Patel',
      walker: 'Ethan Ross',
      time: '10:30 AM',
      duration: '45 min',
      status: 'Scheduled',
    },
    {
      dog: 'Max',
      owner: 'Olivia Green',
      walker: 'Ava Kim',
      time: '11:15 AM',
      duration: '60 min',
      status: 'In progress',
    },
    {
      dog: 'Daisy',
      owner: 'Noah Brooks',
      walker: 'Leo Carter',
      time: '1:00 PM',
      duration: '30 min',
      status: 'Scheduled',
    },
  ]

  const walkers = [
    { name: 'Maya Lopez', area: 'Downtown', walks: 6, rating: '4.9', status: 'On route' },
    { name: 'Ethan Ross', area: 'Northside', walks: 4, rating: '4.8', status: 'Available' },
    { name: 'Ava Kim', area: 'West End', walks: 5, rating: '5.0', status: 'Walking' },
    { name: 'Leo Carter', area: 'Riverside', walks: 3, rating: '4.7', status: 'Break' },
  ]

  const alerts = [
    { title: 'Vaccination reminder', detail: 'Buddy’s records expire in 5 days.' },
    { title: 'Late check-in', detail: 'Walker assigned to Charlie has not checked in yet.' },
    { title: 'New review received', detail: 'Luna received a 5-star review from owner.' },
  ]

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Checked in':
      case 'Available':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
      case 'In progress':
      case 'Walking':
      case 'On route':
        return 'bg-sky-100 text-sky-700 ring-sky-200'
      case 'Scheduled':
        return 'bg-amber-100 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-sm">
              🐾
            </div>
            <div>
              <p className="text-lg font-semibold">Pawprint</p>
              <p className="text-sm text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {[
              ['Overview', true],
              ['Bookings', false],
              ['Walkers', false],
              ['Customers', false],
              ['Dogs', false],
              ['Payments', false],
              ['Reports', false],
              ['Settings', false],
            ].map(([item, active]) => (
              <button
                key={item}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{active ? '●' : '○'}</span>
                <span>{item}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl bg-slate-900 p-4 text-white">
              <p className="text-sm font-semibold">Need staffing support?</p>
              <p className="mt-1 text-sm text-slate-300">
                You’re near capacity this week. Add more walkers to cover demand.
              </p>
              <button className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Manage Hiring
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-sm font-medium text-emerald-600">Welcome back</p>
                <h1 className="text-2xl font-bold tracking-tight">Pawprint Operations Overview</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor bookings, walkers, and daily activity across your dog walking service.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search dogs, owners, walkers..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-400 sm:w-80"
                  />
                </div>
                <button className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                  + New Booking
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-6 lg:p-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${stat.color}`} />
                  </div>
                  <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {stat.change} vs last week
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Upcoming Walks</h2>
                    <p className="text-sm text-slate-500">Today’s scheduled and active appointments</p>
                  </div>
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-3 py-2 font-medium">Dog</th>
                        <th className="px-3 py-2 font-medium">Owner</th>
                        <th className="px-3 py-2 font-medium">Walker</th>
                        <th className="px-3 py-2 font-medium">Time</th>
                        <th className="px-3 py-2 font-medium">Duration</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingWalks.map((walk) => (
                        <tr key={`${walk.dog}-${walk.time}`} className="rounded-2xl bg-slate-50">
                          <td className="rounded-l-xl px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg">
                                🐶
                              </div>
                              <span className="font-medium text-slate-900">{walk.dog}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">{walk.owner}</td>
                          <td className="px-3 py-3 text-sm text-slate-600">{walk.walker}</td>
                          <td className="px-3 py-3 text-sm text-slate-600">{walk.time}</td>
                          <td className="px-3 py-3 text-sm text-slate-600">{walk.duration}</td>
                          <td className="rounded-r-xl px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                                walk.status
                              )}`}
                            >
                              {walk.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Alerts</h2>
                    <p className="text-sm text-slate-500">Important operational updates</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    3 New
                  </span>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.title}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                          !
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{alert.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Review Notifications
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Walker Status</h2>
                    <p className="text-sm text-slate-500">Live team availability and performance</p>
                  </div>
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                    Manage walkers
                  </button>
                </div>

                <div className="space-y-3">
                  {walkers.map((walker) => (
                    <div
                      key={walker.name}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                          {walker.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{walker.name}</p>
                          <p className="text-sm text-slate-500">{walker.area}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Walks</p>
                          <p className="text-sm font-semibold text-slate-700">{walker.walks} today</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Rating</p>
                          <p className="text-sm font-semibold text-slate-700">{walker.rating} ★</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                            walker.status
                          )}`}
                        >
                          {walker.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">Daily Snapshot</h2>
                  <p className="text-sm text-slate-500">Capacity and service performance</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Walk capacity used</span>
                      <span className="font-semibold text-slate-900">76%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 w-[76%] rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">On-time starts</span>
                      <span className="font-semibold text-slate-900">91%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 w-[91%] rounded-full bg-sky-500" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Customer satisfaction</span>
                      <span className="font-semibold text-slate-900">97%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 w-[97%] rounded-full bg-violet-500" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">Top service area</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-900">Downtown</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      12 walks scheduled today with strong repeat bookings.
                    </p>
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
