import { db } from '@/config/firebaseConfig';
import { getAllCustomersFromDb } from '@/services/authService';
import { Popover, PopoverContent, PopoverTrigger, Snippet, Tooltip, Button } from '@heroui/react';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowDownToLine, Eye, Sheet, UserRoundCog } from 'lucide-react';
import React, { useEffect } from 'react'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchAllOrders } from '@/services/orderService';

function Payments() {

	const { data: orders = [], isLoading, isError } = useQuery({
		queryKey: ['orders'],
		queryFn: fetchAllOrders,
		refetchInterval: 5000, // Poll every 5 seconds
	});
	// ...existing code...
	const handleDownloadExcel = () => {
		// Prepare data for Excel based on the table columns
		const data = orders.map((order, index) => ({
			'Sr.No': index + 1,
			'Order ID': order.id,
			'Customer Name': order.customer?.name || '',
			'Customer ID': order.customer?.uid || '',
			'Payment ID': order.razorpay_payment_id || '',
			'Payment Status': order.paymentStatus || '',
			'Order Status': order.orderStatus || '',
			'Total Paid': order.totalAmount || '',
			'Created At': order.createdAt || '',
		}));

		// Create an empty worksheet
		const worksheet = XLSX.utils.aoa_to_sheet([]);

		// Add the heading/title row at the top
		const heading = [["Go Treats Payments Report on " + new Date().toLocaleDateString()]];
		XLSX.utils.sheet_add_aoa(worksheet, heading, { origin: "A1" });

		// Add the data starting from row 2
		XLSX.utils.sheet_add_json(worksheet, data, { origin: "A2", skipHeader: false });

		// Merge the heading row across all columns
		const numCols = Object.keys(data[0] || {}).length;
		worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }];

		// Optional: set column widths for better readability
		worksheet["!cols"] = Array(numCols).fill({ wch: 20 });

		// Create a new workbook and add the worksheet
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
		saveAs(blob, 'gotreats_payments_report.xlsx');
		toast.success("Excel file Generated Successfully");
	};

	const formatOrderDateTime = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(date);
	};


	return (
		<main className='mx-4 w-full'>
			<h1 className="md:text-4xl text-3xl font-bold text-center md:text-start lancelot mb-4 md:mb-2 text-white">Payments</h1>

			<div className='flex justify-end items-center mb-4'>
				<Button
					variant='shadow'
					size='sm' radius='full'
					onPress={handleDownloadExcel}
					// ✅ FIX: Added text-white and font-bold to className
					className='mb-4 text-white font-bold bg-green-500 hover:bg-green-600 transition-colors' 
					// ✅ FIX: Ensured icon color is white
					startContent={<ArrowDownToLine size={15} className='text-white' />} 
				>
					Download Payments
				</Button>

			</div>
			
			<div className="overflow-x-auto mt-2 mb-10">
				{isLoading ? (
					<p className='text-center lancelot animate-pulse my-10'>Loading customers...</p>
				) : (
					<table className="min-w-full bg-white shadow-md rounded-lg">
						<thead className="bg-orange-500 text-white rounded-t-lg">
							<tr>

								<th className="px-6 py-3  border-r">#</th>
								<th className="px-6 py-3  border-r">Order ID</th>
								<th className="px-6 py-3  border-r ">Customer Name</th>
								<th className="px-6 py-3  border-r ">Customer ID</th>
								<th className="px-6 py-3  border-r">Payment ID</th>
								<th className="px-6 py-3  border-r">Payment Status</th>
								<th className="px-6 py-3  border-r">Total Paid</th>
								<th className="px-6 py-3  border-r">Order Status</th>
								<th className="px-6 py-3  border-r">Created At</th>
							</tr>
						</thead>
						<tbody className=' overflow-y-auto'>
							{orders.map((order, index) => {


								return (
									<tr key={order.id} className={` border-b text-sm  `}>
										<td className="px-6  text-center border-r">
											{index + 1}
										</td>
										<td className="px-6 py-1  text-center border-r">
											<Tooltip content={order.id} showArrow placement='right' className="cursor-pointer">
												{order.id.slice(-4)}
											</Tooltip>
										</td>

										{/* customer Code */}
										<td className="px-6  text-center border-r">
											<div className='flex items-center gap-2 justify-center'>
												{order.customer?.name}
											</div>
										</td>
										<td className="px-6  text-center border-r">
											<div>
												{order.customer?.uid}
											</div>
										</td>
										<td className="px-6  text-center border-r">
											{order.razorpay_payment_id ? order.razorpay_payment_id : 'Cash On Delivery'}
										</td>
										<td className="px-6 capitalize  text-center border-r">
											{order.paymentStatus}
										</td>
										<td className="px-6  text-center border-r">
											₹{order.totalAmount}
										</td>
										<td className="px-6  text-center border-r">
											{order.orderStatus}
										</td>

										<td className="px-6  text-center border-r">
											{formatOrderDateTime(order.createdAt)}
										</td>

									</tr>
								)
							})}
						</tbody>
					</table>

				)}
				

			</div>

		</main>
	)
}

export default Payments;
