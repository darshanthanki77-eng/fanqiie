import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart as PieIcon,
    Calendar,
    Download,
    DownloadCloud,
    ArrowUpCircle,
    ArrowDownCircle,
    Package,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend,
    ComposedChart,
    Line
} from 'recharts';
import API_BASE_URL from '../../apiConfig';
import './AdminFinance.css';

const AdminFinance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchFinanceStats();
    }, [startDate, endDate]);

    const fetchFinanceStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = `${API_BASE_URL}/finance/stats`;
            if (startDate || endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching finance stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    const getPieData = () => {
        if (!data) return [];
        return [
            { name: 'Deposits', value: data.summary.totalDeposits },
            { name: 'Withdrawal Fees', value: data.summary.withdrawalFees },
            { name: 'Package Sales', value: data.summary.packageRevenue || 0 }
        ];
    };

    const getExpensePieData = () => {
        if (!data) return [];
        return [
            { name: 'Withdrawals Paid', value: data.summary.totalWithdrawals },
            { name: 'Commissions', value: data.summary.commissions },
            { name: 'ROI/Tasks', value: data.summary.roi }
        ];
    };

    if (loading && !data) {
        return <div className="finance-container"><div className="loading-state">Loading financial records...</div></div>;
    }

    const { summary, chartData } = data;

    // Calculate Trend Period Totals
    const periodIncome = chartData?.reduce((acc, curr) => acc + (curr.income || 0), 0) || 0;
    const periodExpense = chartData?.reduce((acc, curr) => acc + (curr.expense || 0), 0) || 0;
    const periodNet = periodIncome - periodExpense;

    return (
        <div className="finance-container">
            {/* Header */}
            <div className="finance-header">
                <div className="header-left">
                    <button className="back-btn-circle" onClick={() => navigate('/admin')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="finance-title">Financial Treasury</h1>
                </div>
                <button className="export-btn" onClick={() => {/* Future Export */ }}>
                    <DownloadCloud size={16} /> Export Reports
                </button>
            </div>

            {/* Advanced Filters */}
            <div className="finance-filters">
                <div className="filter-group">
                    <label className="filter-label">From Date</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">To Date</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="filter-presets">
                    <button className="preset-btn" onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setStartDate(today);
                        setEndDate(today);
                    }}>Today</button>
                    <button className="preset-btn" onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 7);
                        setStartDate(d.toISOString().split('T')[0]);
                        setEndDate(new Date().toISOString().split('T')[0]);
                    }}>7 Days</button>
                    <button className="preset-btn" onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 30);
                        setStartDate(d.toISOString().split('T')[0]);
                        setEndDate(new Date().toISOString().split('T')[0]);
                    }}>30 Days</button>
                    <button className="preset-btn" onClick={() => {
                        const d = new Date();
                        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                        setStartDate(firstDay);
                        setEndDate(d.toISOString().split('T')[0]);
                    }}>This Month</button>
                    <button className="preset-btn" onClick={() => {
                        setStartDate('');
                        setEndDate('');
                    }}>All Time</button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="summary-grid">
                <div className="finance-stat-card">
                    <span className="stat-label">Total Platform Income</span>
                    <span className="stat-value value-profit">${(summary.totalIncome || 0).toFixed(2)}</span>
                    <div className="stat-footer">
                        <span>Includes Deposits + Fees</span>
                        <TrendingUp size={14} color="#10b981" />
                    </div>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Total Platform Expenses</span>
                    <span className="stat-value value-loss">${(summary.totalExpenses || 0).toFixed(2)}</span>
                    <div className="stat-footer">
                        <span>Withdrawals + Comms + ROI</span>
                        <TrendingDown size={14} color="#ef4444" />
                    </div>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Net Profit / Loss</span>
                    <span className={`stat-value ${(summary.netProfit || 0) >= 0 ? 'value-profit' : 'value-loss'}`}>
                        ${(summary.netProfit || 0).toFixed(2)}
                    </span>
                    <div className="stat-footer">
                        <span>{(summary.netProfit || 0) >= 0 ? 'Surplus' : 'Deficit'}</span>
                        <PieIcon size={14} color={(summary.netProfit || 0) >= 0 ? '#10b981' : '#ef4444'} />
                    </div>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Wallet Balance Held</span>
                    <span className="stat-value value-neutral">
                        ${((summary.totalDeposits || 0) - (summary.totalWithdrawals || 0)).toFixed(2)}
                    </span>
                    <div className="stat-footer">
                        <span>Internal Liquidity</span>
                        <DollarSign size={14} color="#6366f1" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-wrapper">
                <div className="chart-card trend-chart-premium">
                    <div className="chart-header-row">
                        <div className="chart-title-box">
                            <h3 className="chart-title" style={{ marginBottom: '4px' }}>Income vs Expenses Trend</h3>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, paddingLeft: '12px' }}>Real-time cash flow performance</p>
                        </div>
                        <div className="chart-local-filters">
                            {['7D', '15D', '30D', '3M'].map(range => (
                                <button key={range} className="chart-filter-btn" onClick={() => {
                                    const d = new Date();
                                    const days = range === '7D' ? 7 : range === '15D' ? 15 : range === '30D' ? 30 : 90;
                                    d.setDate(d.getDate() - days);
                                    setStartDate(d.toISOString().split('T')[0]);
                                    setEndDate(new Date().toISOString().split('T')[0]);
                                }}>{range}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 350, marginTop: '20px', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncomePremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpensePremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="area-glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                                        <feOffset dx="0" dy="8" result="offsetblur" />
                                        <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
                                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '13px', padding: '4px 0' }}
                                    formatter={(value, name) => [`$${value.toLocaleString()}`, name?.charAt(0).toUpperCase() + name?.slice(1)]}
                                />
                                <Legend verticalAlign="top" align="right" height={40} iconType="circle" />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorIncomePremium)"
                                    strokeWidth={4}
                                    filter="url(#area-glow)"
                                    animationDuration={2000}
                                    tension={0.4}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorExpensePremium)"
                                    strokeWidth={4}
                                    filter="url(#area-glow)"
                                    animationDuration={2000}
                                    tension={0.4}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="trend-footer-analytics">
                        <div className="trend-analytic-item">
                            <span className="analytic-label">Total Period Income</span>
                            <span className="analytic-val income">${periodIncome.toLocaleString()}</span>
                        </div>
                        <div className="trend-analytic-item">
                            <span className="analytic-label">Total Period Expenses</span>
                            <span className="analytic-val expense">${periodExpense.toLocaleString()}</span>
                        </div>
                        <div className="trend-analytic-item">
                            <span className="analytic-label">Period Net Performance</span>
                            <div className="analytic-val-group">
                                <span className={`analytic-val ${periodNet >= 0 ? 'profit' : 'loss'}`}>
                                    ${periodNet.toLocaleString()}
                                </span>
                                <span className="growth-chip">
                                    <TrendingUp size={10} /> +8.5%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-card revenue-sources-card" style={{ position: 'relative' }}>
                    <h3 className="chart-title">Revenue Sources</h3>
                    <div style={{ width: '100%', height: 350, position: 'relative', minWidth: 0 }}>
                        {/* Center Total Revenue Label */}
                        <div className="chart-center-label">
                            <span className="center-title">Total Revenue</span>
                            <span className="center-value">${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="center-growth">
                                <TrendingUp size={12} /> +12.4%
                            </span>
                        </div>

                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <defs>
                                    <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                    <linearGradient id="gradFee" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <linearGradient id="gradPkg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                                        <feOffset dx="0" dy="8" result="offsetblur" />
                                        <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
                                        <feMerge>
                                            <feMergeNode />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <Pie
                                    data={getPieData()}
                                    innerRadius={75}
                                    outerRadius={105}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={200}
                                    animationDuration={1500}
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const radius = outerRadius + 20;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="700">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {getPieData().map((entry, index) => {
                                        const gradients = ['url(#gradDep)', 'url(#gradFee)', 'url(#gradPkg)'];
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={gradients[index % gradients.length]}
                                                filter="url(#shadow)"
                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                className="donut-segment"
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', color: '#fff', padding: '4px 0' }}
                                    formatter={(value, name, props) => {
                                        const total = getPieData().reduce((sum, entry) => sum + entry.value, 0);
                                        const percent = ((value / total) * 100).toFixed(1);
                                        return [`$${value.toLocaleString()} (${percent}%)`, name];
                                    }}
                                />
                                <Legend
                                    layout="horizontal"
                                    align="center"
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value, entry) => {
                                        const item = getPieData().find(p => p.name === value);
                                        const total = getPieData().reduce((sum, entry) => sum + entry.value, 0);
                                        const pct = item ? ((item.value / total) * 100).toFixed(0) : 0;
                                        return <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginLeft: '4px' }}>{value} <span style={{ color: '#6366f1', marginLeft: '2px' }}>{pct}%</span></span>
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="charts-wrapper">
                <div className="chart-card profit-analytics-card">
                    <div className="chart-header-row">
                        <h3 className="chart-title">Profit Analysis (Fintech View)</h3>
                        <div className="mini-insights-container">
                            <div className="mini-insight">
                                <span className="insight-label">Today</span>
                                <span className={`insight-val ${(chartData[chartData.length - 1]?.profit || 0) >= 0 ? 'pos' : 'neg'}`}>
                                    ${(chartData[chartData.length - 1]?.profit || 0).toFixed(0)}
                                </span>
                            </div>
                            <div className="mini-insight">
                                <span className="insight-label">Peak</span>
                                <span className="insight-val pos">
                                    ${Math.max(...chartData.map(d => d.profit), 0).toFixed(0)}
                                </span>
                            </div>
                            <div className="mini-insight">
                                <span className="insight-label">Low</span>
                                <span className="insight-val neg">
                                    ${Math.min(...chartData.map(d => d.profit), 0).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 350, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <ComposedChart data={chartData}>
                                <defs>
                                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                    <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#dc2626" />
                                    </linearGradient>
                                    <filter id="composed-shadow" x="-5%" y="-5%" width="110%" height="110%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                        <feOffset dx="0" dy="4" result="offsetblur" />
                                        <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        background: 'rgba(30, 41, 59, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)'
                                    }}
                                    formatter={(value, name) => [`$${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                                />
                                <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar dataKey="income" fill="url(#gradIncome)" radius={[4, 4, 0, 0]} barSize={24} filter="url(#composed-shadow)" animationDuration={1500} />
                                <Bar dataKey="expense" fill="url(#gradExpense)" radius={[4, 4, 0, 0]} barSize={24} filter="url(#composed-shadow)" animationDuration={1500} />
                                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} animationDuration={2000} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Expense Breakdown</h3>
                    <div style={{ width: '100%', height: 300, position: 'relative', minWidth: 0 }}>
                        {/* Center Total Expense Label */}
                        <div className="chart-center-label">
                            <span className="center-title">Total Expenses</span>
                            <span className="center-value">${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="center-growth" style={{ color: '#ef4444' }}>
                                <TrendingDown size={12} /> +5.2%
                            </span>
                        </div>

                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <defs>
                                    <linearGradient id="gradWith" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#d97706" />
                                    </linearGradient>
                                    <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                    <linearGradient id="gradROI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#b91c1c" />
                                    </linearGradient>
                                    <filter id="shadow-exp-premium" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                        <feOffset dx="0" dy="6" result="offsetblur" />
                                        <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
                                        <feMerge>
                                            <feMergeNode />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <Pie
                                    data={getExpensePieData()}
                                    innerRadius={75}
                                    outerRadius={105}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const radius = outerRadius + 20;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="700">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {getExpensePieData().map((entry, index) => {
                                        const gradients = ['url(#gradWith)', 'url(#gradComm)', 'url(#gradROI)'];
                                        return (
                                            <Cell
                                                key={`cell-exp-${index}`}
                                                fill={gradients[index % gradients.length]}
                                                filter="url(#shadow-exp-premium)"
                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                className="donut-segment"
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', color: '#fff', padding: '4px 0' }}
                                    formatter={(value, name) => {
                                        const total = getExpensePieData().reduce((sum, entry) => sum + entry.value, 0);
                                        const percent = ((value / total) * 100).toFixed(1);
                                        return [`$${value.toLocaleString()} (${percent}%)`, name];
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value) => {
                                        const item = getExpensePieData().find(p => p.name === value);
                                        const total = getExpensePieData().reduce((sum, entry) => sum + entry.value, 0);
                                        const pct = item ? ((item.value / total) * 100).toFixed(0) : 0;
                                        return <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>{value} <span style={{ color: '#ef4444', marginLeft: '2px' }}>{pct}%</span></span>
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table Breakdown */}
            <div className="breakdown-section">
                <h3 className="chart-title">Detailed Financial Ledger</h3>
                <div className="table-wrapper">
                    <table className="breakdown-table">
                        <thead>
                            <tr>
                                <th>Revenue Component</th>
                                <th>Type</th>
                                <th>Count</th>
                                <th>Total Volume</th>
                                <th>Platform Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="source-item">
                                        <div className="source-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><ArrowUpCircle size={18} color="#10b981" /></div>
                                        <span>User Deposits (Recharge)</span>
                                    </div>
                                </td>
                                <td><span className="type-badge type-income">INCOME</span></td>
                                <td>{summary.packageSales}</td>
                                <td>${summary.totalDeposits.toFixed(2)}</td>
                                <td style={{ color: '#10b981', fontWeight: 600 }}>+${summary.totalDeposits.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="source-item">
                                        <div className="source-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}><ArrowDownCircle size={18} color="#6366f1" /></div>
                                        <span>Withdrawal Service Fees</span>
                                    </div>
                                </td>
                                <td><span className="type-badge type-income">REVENUE</span></td>
                                <td>-</td>
                                <td>${summary.withdrawalFees.toFixed(2)}</td>
                                <td style={{ color: '#10b981', fontWeight: 600 }}>+${summary.withdrawalFees.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="source-item">
                                        <div className="source-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}><ArrowDownCircle size={18} color="#ef4444" /></div>
                                        <span>User Withdrawals (Paid)</span>
                                    </div>
                                </td>
                                <td><span className="type-badge type-expense">EXPENSE</span></td>
                                <td>-</td>
                                <td>${summary.totalWithdrawals.toFixed(2)}</td>
                                <td style={{ color: '#ef4444' }}>-${summary.totalWithdrawals.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="source-item">
                                        <div className="source-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><Users size={18} color="#f59e0b" /></div>
                                        <span>Team Commissions</span>
                                    </div>
                                </td>
                                <td><span className="type-badge type-expense">EXPENSE</span></td>
                                <td>-</td>
                                <td>${summary.commissions.toFixed(2)}</td>
                                <td style={{ color: '#ef4444' }}>-${summary.commissions.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="source-item">
                                        <div className="source-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}><Package size={18} color="#a855f7" /></div>
                                        <span>ROI Payouts (Task Earnings)</span>
                                    </div>
                                </td>
                                <td><span className="type-badge type-expense">EXPENSE</span></td>
                                <td>-</td>
                                <td>${summary.roi.toFixed(2)}</td>
                                <td style={{ color: '#ef4444' }}>-${summary.roi.toFixed(2)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, padding: '20px' }}>ESTIMATED NET PERFORMANCE:</td>
                                <td style={{ color: summary.netProfit >= 0 ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: '18px', padding: '20px' }}>
                                    ${summary.netProfit.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;
