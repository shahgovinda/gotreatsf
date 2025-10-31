import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, RadioGroup, Radio, Chip, DateRangePicker, Input, NumberInput, Select, SelectItem, Switch
} from "@heroui/react";

import Button from '@/components/Button'
import { Voucher, VoucherScope, VoucherDiscountType } from '@/types/voucherTypes'
import { Earth, IndianRupee, Percent, TicketPercent, UserRound, UserRoundPlus, UsersRound } from 'lucide-react'
import React from 'react'
import type { RangeValue } from "@react-types/shared";
import type { DateValue } from "@react-types/datepicker";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import { create } from "domain";
import { useMutation } from '@tanstack/react-query'
import { createVoucher } from "@/services/voucherService";

const defaultForm = {
    name: '',
    code: '',
    discountType: 'percentage' as VoucherDiscountType,
    discountValue: 0,
    minOrderValue: 100,
    maxUses: 1,
    scope: 'all' as VoucherScope,
    allowedUsers: [] as string[],
    singleUsePerCustomer: true,
};

const VoucherForm = ({
    isOpen,
    onOpenChange,
    onOpen,
    refetchVouchers
}: {
    isOpen: boolean,
    onOpenChange: () => void,
    onOpen: () => void,
    refetchVouchers: () => void
}) => {
    const [form, setForm] = React.useState({ ...defaultForm });
    const [allowedUserInput, setAllowedUserInput] = React.useState('');
    const [dateRange, setDateRange] = React.useState<RangeValue<DateValue> | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setForm({ ...defaultForm });
            setDateRange(null);
        }
    }, [isOpen]);

    // Mutation for creating voucher
    const { mutate: createVoucherMutation, isPending } = useMutation({
        mutationFn: createVoucher,
        onSuccess: () => {
            refetchVouchers();
            onOpenChange();
        },
        onError: (error) => {
            alert('Failed to create voucher');
        }
    });

    // Handle scope change
    const handleScopeChange = (scope: VoucherScope) => {
        setForm(f => ({
            ...f,
            scope,
            allowedUsers: scope === 'all' ? [] : f.allowedUsers,
        }));
    };

    // Handle allowed user add
    const handleAddAllowedUser = () => {
        if (!allowedUserInput.trim()) return;
        if (form.scope === 'specific') {
            setForm(f => ({ ...f, allowedUsers: Array.from(new Set([...f.allowedUsers, allowedUserInput.trim()])) }));
        }
        setAllowedUserInput('');
    };

    // Handle allowed user remove
    const handleRemoveAllowedUser = (user: string) => {
        setForm(f => ({ ...f, allowedUsers: f.allowedUsers.filter(u => u !== user) }));
    };

    // Handle discount type change
    const handleDiscountTypeChange = (val: string) => {
        setForm(f => ({ ...f, discountType: val as VoucherDiscountType }));
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manual validation
        if (
            !form.name.trim() ||
            !form.code.trim() ||
            !form.discountValue ||
            !form.minOrderValue ||
            !form.maxUses ||
            !dateRange?.start ||
            !dateRange?.end ||
            ((form.scope === 'specific') && form.allowedUsers.length === 0)
        ) {
            alert("Please fill all Voucher fields.");
            return;
        }

        // Convert DateValue to JS Date using getLocalTimeZone
        let startDate: Date | undefined = undefined;
        let expiryDate: Date | undefined = undefined;
        if (dateRange?.start && dateRange?.end) {
            startDate = dateRange.start.toDate(getLocalTimeZone());
            expiryDate = dateRange.end.toDate(getLocalTimeZone());
        }

        // Prepare voucher object
        const voucher: Voucher = {
            ...form,
            startDate: startDate!,
            expiryDate: expiryDate!,
            currentUses: 0,
            userUsage: {},
            createdAt: new Date(),
            status: 'active'
        };

        if (form.scope === 'all') {
            delete voucher.allowedUsers;
        }
        createVoucherMutation(voucher);
        navigator.clipboard.writeText(voucher.code)
    };
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}  placement="center" scrollBehavior='inside' backdrop='blur'>
            <ModalContent className="bg-white">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center lancelot text-2xl gap-3"> <TicketPercent size={25} strokeWidth={1.6} />Create Voucher</ModalHeader>
                        <ModalBody>
                            <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                                {/* Voucher Name */}
                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-semibold text-gray-700'>Voucher Name*</label> {/* ✅ Manually defined label */}
                                    <Input
                                        variant='faded'
                                        // ❌ REMOVED: label="Voucher Name"
                                        // ❌ REMOVED: labelPlacement='outside'
                                        placeholder="e.g., GET 30% OFF on all meals"
                                        autoFocus
                                        isRequired
                                        isClearable
                                        value={form.name}
                                        onValueChange={val => setForm(f => ({ ...f, name: val }))}
                                    />
                                </div>
                                
                                {/* Voucher Code */}
                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-semibold text-gray-700'>Voucher Code*</label> {/* ✅ Manually defined label */}
                                    <Input
                                        variant='faded'
                                        // ❌ REMOVED: label="Voucher Code"
                                        // ❌ REMOVED: labelPlacement='outside'
                                        placeholder="e.g., TASTY30"
                                        startContent={<TicketPercent size={20} color='gray' strokeWidth={1.6} />}
                                        isRequired
                                        isClearable
                                        value={form.code}
                                        onValueChange={val => setForm(f => ({ ...f, code: val.toUpperCase() }))}
                                    />
                                </div>
                                
                                <p className='text-sm font-semibold text-gray-700'>Discount Type</p> {/* ✅ Moved outside */}
                                <div className='flex gap-4 items-end'>
                                    <div className="flex flex-col w-1/2">
                                        
                                        <RadioGroup
                                            color='primary'
                                            isRequired
                                            value={form.discountType}
                                            onValueChange={handleDiscountTypeChange}
                                            orientation="horizontal" 
                                            className='mt-2'
                                        >
                                            <Radio value="percentage">Percentage</Radio>
                                            <Radio value="fixed">Fixed</Radio>
                                        </RadioGroup>
                                    </div>
                                    <div className="w-1/2">
                                        <label className='text-sm font-medium text-gray-700 block'>Discount Value*</label> {/* ✅ Manually defined label */}
                                        <NumberInput
                                            className='mt-1'
                                            variant='faded'
                                            // ❌ REMOVED: label="Discount Value"
                                            // ❌ REMOVED: labelPlacement='outside'
                                            placeholder="0"
                                            startContent={form.discountType === 'percentage' ? <Percent size={20} color='gray' strokeWidth={1.6} /> : <IndianRupee size={20} color='gray' strokeWidth={1.6} />}
                                            isRequired
                                            value={form.discountValue}
                                            onValueChange={val => setForm(f => ({ ...f, discountValue: Number(val) }))}
                                        />
                                    </div>
                                </div>
                                
                                {/* Min Order Value / Max Uses */}
                                <div className='flex gap-4'>
                                    <div className="inline-flex flex-col w-full gap-1"> {/* ✅ Added gap-1 */}
                                        <label className='text-sm font-medium text-gray-700'>Minimum Order Value*</label> {/* ✅ Manually defined label */}
                                        <NumberInput
                                            variant='faded'
                                            // ❌ REMOVED: label="Minimum Order Value"
                                            // ❌ REMOVED: labelPlacement='outside'
                                            placeholder="100"
                                            startContent={<IndianRupee size={20} color='gray' strokeWidth={1.6} />}
                                            isRequired
                                            value={form.minOrderValue}
                                            onValueChange={val => setForm(f => ({ ...f, minOrderValue: Number(val) }))}
                                        />
                                    </div>
                                    <div className="inline-flex flex-col w-full gap-1"> {/* ✅ Added gap-1 */}
                                        <label className='text-sm font-medium text-gray-700'>Maximum Uses*</label> {/* ✅ Manually defined label */}
                                        <NumberInput
                                            variant='faded'
                                            // ❌ REMOVED: label="Maximum Uses"
                                            // ❌ REMOVED: labelPlacement='outside'
                                            placeholder="1"
                                            isRequired
                                            value={form.maxUses}
                                            onValueChange={val => setForm(f => ({ ...f, maxUses: Number(val) }))}
                                        />
                                    </div>
                                </div>
                                
                                {/* Date Range Picker */}
                                <div className='flex gap-4 flex-col'>
                                    <label className='text-sm font-semibold text-gray-700'>Start and Expiry Date*</label> {/* ✅ Manually defined label */}
                                    <DateRangePicker
                                        className="bg-white"
                                        // ❌ REMOVED: label="Start and Expiry Date"
                                        // ❌ REMOVED: labelPlacement='outside'
                                        // ✅ NOTE: Placeholder is now displayed using the value={dateRange} prop
                                        minValue={today(getLocalTimeZone())}
                                        value={dateRange}
                                        onChange={setDateRange}
                                    />
                                </div>
                                
                                {/* Scope and Single Use Switch */}
                                <div className='flex justify-between items-center gap-4'>
                                    <div className="flex flex-col w-1/2 gap-1"> {/* ✅ Added gap-1 */}
                                        <label className='text-sm font-medium text-gray-700'>Voucher Scope*</label> {/* ✅ Manually defined label */}
                                        <Select
                                            className="bg-white"
                                            variant='faded'
                                            placeholder='Select Scope of Voucher'
                                            radius='lg'
                                            // ❌ REMOVED: label="Voucher Scope"
                                            // ❌ REMOVED: labelPlacement='outside'
                                            selectedKeys={[form.scope]}
                                            onSelectionChange={keys => handleScopeChange(Array.from(keys)[0] as VoucherScope)}
                                        >
                                            <SelectItem key="all" startContent={<Earth size={20} strokeWidth={1.6} />}>Everyone</SelectItem>
                                            <SelectItem key="specific" startContent={<UsersRound size={20} strokeWidth={1.6} />}>Specific Users</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2 w-1/2 justify-end pt-5">
                                        <label className="text-sm font-medium text-gray-700">Single Use Per Customer</label>
                                        <Switch
                                            size="sm"
                                            isSelected={form.singleUsePerCustomer}
                                            onValueChange={val => setForm(f => ({ ...f, singleUsePerCustomer: val }))}
                                        />
                                    </div>
                                </div>
                                
                                {/* Allowed Users: only for specific scope */}
                                {(form.scope === 'specific') && (
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex items-end gap-4'>
                                            <div className='w-full flex flex-col gap-1'> {/* Added gap-1 for label spacing */}
                                                <label className='text-sm font-medium text-gray-700'>Add Allowed User (Phone)*</label> {/* ✅ Manually defined label */}
                                                <Input
                                                    variant='faded'
                                                    // ❌ REMOVED: label="Allowed Users"
                                                    // ❌ REMOVED: labelPlacement='outside'
                                                    placeholder="Enter Registered Phone Number"
                                                    isRequired
                                                    isClearable
                                                    value={allowedUserInput}
                                                    onValueChange={setAllowedUserInput}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddAllowedUser();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className='px-4 py-2 rounded-xl border-2 bg-primary text-white flex items-center justify-center h-[54px] transition-colors'
                                                onClick={handleAddAllowedUser}
                                            >
                                                <UserRoundPlus size={20} strokeWidth={1.6} />
                                            </button>
                                        </div>
                                        <div className='flex justify-start gap-x-2 gap-y-2 flex-wrap pt-2'>
                                            {form.allowedUsers.map(user => (
                                                <Chip
                                                    key={user}
                                                    variant='faded'
                                                    color='success'
                                                    size='md'
                                                    onClose={() => handleRemoveAllowedUser(user)}
                                                >
                                                    {user}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" onClick={handleSubmit} isLoading={isPending}>
                                Save
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default VoucherForm
