import React from 'react'

export default function KPICard({ title, value, icon: Icon, colorClass, trend, subtitle }) {
  return (
    <div className="card card-interactive card-lit flex flex-col justify-between p-6 min-h-[130px]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
          {subtitle && (
            <p className="text-[11px] text-text-secondary/60 leading-snug">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-text-primary leading-none">{value}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            trend.isUp ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
          }`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
