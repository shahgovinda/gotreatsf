import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllOrders } from '@/services/orderService';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Collections() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchAllOrders,
        refetchInterval: 5000,
    });

    // Month pagination state
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Date helpers
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);

    // Filter orders for the selected month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthOrders = orders.filter(order => {
        const d = new Date(order.createdAt);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    // Day-wise grouping for the month
    const ordersByDate = monthOrders.reduce((acc, order) => {
        const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {} as Record<string, typeof orders>);

    const dayWiseData = Object.entries(ordersByDate)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, orders]) => ({
            date: format(new Date(date), 'dd MMM yyyy'),
            total: orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
            count: orders.length,
        }));

    // Cards data (all orders, not just month)
    const todaysOrders = orders.filter(order => isSameDay(new Date(order.createdAt), today));
    const todaysCollection = todaysOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const yesterdaysCollection = orders
        .filter(order => isSameDay(new Date(order.createdAt), yesterday))
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const thisWeekCollection = orders
        .filter(order => {
            const d = new Date(order.createdAt);
            return d >= thisMonday && d <= today;
        })
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const lastWeekCollection = orders
        .filter(order => {
            const d = new Date(order.createdAt);
            return d >= lastMonday && d <= lastSunday;
        })
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const monthCollection = monthOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    // Month navigation
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <main className=' w-full'>
            <h1 className="md:text-4xl text-3xl font-bold text-center md:text-start lancelot mb-4 md:mb-2 text-white">Collections</h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">Today's Orders</p>
                    <p className="text-2xl font-bold text-orange-600">{todaysOrders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">Today's Collection</p>
                    <p className="text-2xl font-bold text-green-600">₹{todaysCollection.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">Yesterday's Collection</p>
                    <p className="text-2xl font-bold text-blue-600">₹{yesterdaysCollection.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">This Week's Collection</p>
                    <p className="text-2xl font-bold text-purple-600">₹{thisWeekCollection.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">Last Week's Collection</p>
                    <p className="text-2xl font-bold text-pink-600">₹{lastWeekCollection.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1 text-center min-w-[180px]">
                    <p className="text-gray-500 text-sm">This Month's Collection</p>
                    <p className="text-2xl font-bold text-indigo-600">₹{monthCollection.toLocaleString()}</p>
                </div>
            </div>

            {/* Month Pagination */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant='solid' size='sm'
                    color='success' radius='lg'
                    onPress={handlePrevMonth}
                    startContent={<ChevronLeft size={16} className='text-white' />} // ✅ Added text-white
                    className='text-white font-bold' // ✅ Added text-white font-bold
                >
                    Previous Month
                </Button>
                <span className="font-semibold text-lg text-green-500 comfortaa">
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button
                    variant='solid' size='sm'
                    onPress={handleNextMonth}
                    color='success' radius='lg'
                    disabled={isSameMonth(currentMonth, new Date())}
                    endContent={<ChevronRight size={16} className='text-white' />} // ✅ Added text-white
                    className='text-white font-bold' // ✅ Added text-white font-bold
                >
                    Next Month
                </Button>
            </div>

            {/* Day-wise Collection Table */}
            <div className="overflow-x-auto mt-2 mb-10">
                {isLoading ? (
                    <p className='text-center lancelot animate-pulse my-10'>Loading collections...</p>
                ) : (
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-orange-500 text-white rounded-t-lg">
                            <tr>
                                <th className="px-6 py-3 border-r">Date</th>
                                <th className="px-6 py-3 border-r">Total Collection</th>
                                <th className="px-6 py-3 border-r">Number of Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayWiseData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-6 text-gray-400">No data for this month.</td>
                                </tr>
                            ) : (
                                <>
                                    {dayWiseData.map((row) => (
                                        <tr key={row.date} className="border-b text-sm">
                                            <td className="px-6 py-2 text-center border-r">{row.date}</td>
                                            <td className="px-6 py-2 text-center border-r font-bold text-green-700">₹{row.total.toLocaleString()}</td>
                                            <td className="px-6 py-2 text-center border-r">{row.count}</td>
                                        </tr>
                                    ))}
                                    {/* Summary Row */}
                                    <tr className="bg-orange-100 font-bold">
                                        <td className="px-6 py-2 text-center border-r">Total</td>
                                        <td className="px-6 py-2 text-center border-r text-green-800">₹{monthCollection.toLocaleString()}</td>
                                        <td className="px-6 py-2 text-center border-r">{monthOrders.length}</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
}

export default Collections;
