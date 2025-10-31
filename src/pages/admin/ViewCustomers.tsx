import { db } from '@/config/firebaseConfig';
import { getAllCustomersFromDb } from '@/services/authService';
import { Popover, PopoverContent, PopoverTrigger, Snippet, Tooltip, Button } from '@heroui/react';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowDownToLine, Eye, Sheet, UserRoundCog } from 'lucide-react';
import React, { useEffect } from 'react'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
// import Button from '@/components/Button';

type Customer = {
	id?: string;
	role?: 'customer' | 'admin';
	displayName?: string;
	phoneNumber?: string;
	email?: string;
	address?: {
		flatNumber?: string;
		buildingName?: string;
		streetAddress?: string;
		area?: string;
		pincode?: string;
	};
	// add other properties as needed
};

const ViewCustomers = () => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [customers, setCustomers] = React.useState<Customer[]>([]);
	const [orderCounts, setOrderCounts] = React.useState<Record<string, number>>({});

	const fetchOrderCountsByCustomer = async (): Promise<Record<string, number>> => {
		const snapshot = await getDocs(collection(db, 'orders'));
		const counts: Record<string, number> = {};
		snapshot.forEach(doc => {
			const data = doc.data();
			const customerId = data.customer?.uid; // adjust as per your Firestore structure
			if (customerId) {
				counts[customerId] = (counts[customerId] || 0) + 1;
			}
		});
		return counts;
	};

	useEffect(() => {
		const fetchCustomers = async () => {
			setIsLoading(true);
			const res = await getAllCustomersFromDb();
			if (res) {
				const customersArray = Object.values(res).filter((customer) => (customer as Customer).role !== 'admin') as Customer[]; // Exclude admin users
				setCustomers(customersArray);
				setIsLoading(false);
			} else {
				console.error("No customers found or error fetching customers");
				setIsLoading(false);
			}
		};
		fetchCustomers();
	}, [])

	useEffect(() => {
		const getOrderCounts = async () => {
			const counts = await fetchOrderCountsByCustomer();
			setOrderCounts(counts);
		};
		getOrderCounts();
	}, []);


	const handleDownloadExcel = () => {
		// Prepare data for Excel
		const data = customers.map((customer, index) => ({
			'Sr.No': index + 1,
			'ID': customer.id,
			'Name': customer.displayName,
			'Number': customer.phoneNumber,
			'Email': customer.email,
			'Address': `${customer.address?.flatNumber}, ${customer.address?.buildingName}, ${customer.address?.streetAddress}, ${customer.address?.area}, ${customer.address?.pincode}`,
			'Orders Count': orderCounts[customer.id ?? ''] ?? 0,
		}));

		// Create an empty worksheet
		const worksheet = XLSX.utils.aoa_to_sheet([]);

		// Add the heading/title row at the top
		const heading = [["Go Treats Customers Report on " + new Date().toLocaleDateString()]];
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
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
		saveAs(blob, 'gotreats_list_of_customers.xlsx');
		toast.success("Excel file Generated Successfully");
	};

	return (


		<main className='mx-4 w-full'>
			<h1 className="md:text-4xl text-3xl font-bold text-center md:text-start lancelot mb-4 md:mb-2 text-white">Customers</h1>

			<div className='flex justify-end items-center mb-4'>
				<Button
					// ✅ FIX: Change variant to solid/default and set color to 'success' (green)
					variant='solid'
					color='success' 
					size='sm' radius='full'
					onPress={handleDownloadExcel}
					className='mb-4 text-white font-bold' // ✅ Ensure text is white and bold
					startContent={<ArrowDownToLine size={15} className='text-white' />} // ✅ Ensure icon is white
				>
					Customers Excel
				</Button>
				
			</div>
			<div className="overflow-x-auto mt-2 mb-10">
				{isLoading ? (
					<p className='text-center lancelot animate-pulse my-10'>Loading customers...</p>
				) : (
					<table className="min-w-full bg-white shadow-md rounded-lg">
						<thead className="bg-orange-500 text-white rounded-t-lg">
							<tr>
								<th className="px-6 py-3 border-r">#</th>
								<th className="px-6 py-3 border-r">ID</th>
								<th className="px-6 py-3 border-r ">Name</th>
								<th className="px-6 py-3 border-r">Number</th>
								<th className="px-6 py-3 border-r">Email</th>
								<th className="px-6 py-3 border-r">Address</th>
								<th className="px-6 py-3 border-r">Orders Count</th>
							</tr>
						</thead>
						<tbody className=' overflow-y-auto'>
							{customers.map((customer, index) => {

								const address = `${customer.address?.flatNumber}, ${customer.address?.buildingName}, ${customer.address?.streetAddress}, ${customer.address?.area}, ${customer.address?.pincode}`;

								return (
									<tr key={customer.id} className={` border-b text-sm  `}>

										<td className="px-6  text-center border-r">
											{index + 1}
										</td>
										<td className="px-6  text-center border-r">
											<Tooltip content={customer.id} showArrow placement='right' className="cursor-pointer">
												{customer.id.slice(-4)}
											</Tooltip>
										</td>

										{/* customer Code */}
										<td className="px-6  text-center border-r">
											<div className='flex items-center gap-2 justify-center'>
												{customer?.role === 'admin' && <UserRoundCog size={18} />}
												{customer?.displayName}
											</div>
										</td>
										<td className="px-6  text-center border-r">
											<div>
												<Snippet className=' bg-white' disableTooltip hideSymbol variant='flat' size='sm'>
													<p className='text-sm font-medium '>
														{customer?.phoneNumber}
													</p>

												</Snippet>
											</div>
										</td>
										<td className="px-6  text-center border-r">
											{customer?.email}
										</td>

										<td className="px-6 flex items-center border-r  justify-center">
											{/* <Popover placement='bottom'>
												<PopoverTrigger className="cursor-pointer">
													<Button isIconOnly variant="light" className="p-2">
														<Eye size={20} />
													</Button>
												</PopoverTrigger>
												<PopoverContent>
													{
														address ? (
															<p className='w-[200px] '>{address}</p>
														) : (
															<p className='text-red-500'>Address not available</p>
														)
													}
												</PopoverContent>
											</Popover> */}
											<p className='text-center text-wrap py-2'>{address}</p>
										</td>

										<td className="px-6  text-center border-r">
											{orderCounts[customer.id ?? ''] ?? 0}
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

export default ViewCustomers;
