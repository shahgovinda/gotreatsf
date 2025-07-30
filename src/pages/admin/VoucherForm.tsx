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
                                <div>
                                    {/* <p className='text-sm'>Voucher Name*</p> */}
                                    <Input
                                        variant='faded'
                                        label="Voucher Name"
                                        placeholder="Get 30% OFF"
                                        labelPlacement='outside'
                                        autoFocus
                                        isRequired
                                        isClearable
                                        value={form.name}
                                        onValueChange={val => setForm(f => ({ ...f, name: val }))}
                                    />
                                </div>
                                <div>
                                    {/* <p className='text-sm'>Voucher Code*</p> */}
                                    <Input
                                        variant='faded'
                                        label="Voucher Code"
                                        placeholder="TASTY30"
                                        labelPlacement='outside'
                                        startContent={<TicketPercent size={20} color='gray' strokeWidth={1.6} />}
                                        isRequired
                                        isClearable
                                        value={form.code}
                                        onValueChange={val => setForm(f => ({ ...f, code: val.toUpperCase() }))}
                                    />
                                </div>
                                <p className='text-sm'>Discount Type</p>
                                <div className='flex gap-4 justify-between'>
                                    <RadioGroup
                                        color='primary'
                                        isRequired
                                        value={form.discountType}
                                        onValueChange={handleDiscountTypeChange}
                                    >
                                        <Radio value="percentage">Percentage</Radio>
                                        <Radio value="fixed">Fixed</Radio>
                                    </RadioGroup>
                                    <div className="">
                                        {/* <p className='text-sm'>Discount Value*</p> */}
                                        <NumberInput
                                            className=''
                                            variant='faded'
                                            label="Discount Value"
                                            placeholder="Discount Value"
                                            labelPlacement='outside'
                                            startContent={form.discountType === 'percentage' ? <Percent size={20} color='gray' strokeWidth={1.6} /> : <IndianRupee size={20} color='gray' strokeWidth={1.6} />}
                                            isRequired
                                            value={form.discountValue}
                                            onValueChange={val => setForm(f => ({ ...f, discountValue: Number(val) }))}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <div className="inline-flex flex-col w-full">
                                        {/* <p className='text-sm'>Minimum Order Value*</p> */}
                                        <NumberInput
                                            variant='faded'
                                            label="Minimum Order Value"
                                            placeholder="Minimum Order Value"
                                            labelPlacement='outside'
                                            startContent={<IndianRupee size={20} color='gray' strokeWidth={1.6} />}
                                            isRequired
                                            value={form.minOrderValue}
                                            onValueChange={val => setForm(f => ({ ...f, minOrderValue: Number(val) }))}
                                        />
                                    </div>
                                    <div className="inline-flex flex-col w-full">
                                        {/* <p className='text-sm'>Maximum Uses*</p> */}

                                        <NumberInput
                                            variant='faded'
                                            label="Maximum Uses"
                                            placeholder="Limits the number of times voucher can be used"
                                            labelPlacement='outside'
                                            isRequired
                                            value={form.maxUses}
                                            onValueChange={val => setForm(f => ({ ...f, maxUses: Number(val) }))}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <DateRangePicker
                                        className="bg-white"
                                        label="Start and Expiry Date"
                                        variant='faded'
                                        labelPlacement='outside'
                                         minValue={today(getLocalTimeZone())}
                                        value={dateRange}
                                        onChange={setDateRange}
                                    />
                                </div>
                                <div className='flex justify-center items-center gap-4'>
                                    <div className="flex flex-col w-full">
                                        {/* <p className='text-sm'>Select Scope*</p> */}

                                        <Select
                                            className=""
                                            variant='faded'
                                            placeholder='Select Scope of Voucher'
                                            radius='lg'
                                            labelPlacement='outside'
                                            label="Select Scope"
                                            selectedKeys={[form.scope]}
                                            onSelectionChange={keys => handleScopeChange(Array.from(keys)[0] as VoucherScope)}
                                        >
                                            <SelectItem key="all" startContent={<Earth size={20} strokeWidth={1.6} />}>Everyone</SelectItem>
                                            <SelectItem key="specific" startContent={<UsersRound size={20} strokeWidth={1.6} />}>Specific</SelectItem>

                                        </Select>
                                    </div>
                                    <div className="w-full">
                                        <Switch
                                            size='sm'
                                            isSelected={form.singleUsePerCustomer}
                                            onValueChange={val => setForm(f => ({ ...f, singleUsePerCustomer: val }))}
                                        >
                                            Single Use Per Customer
                                        </Switch>
                                    </div>
                                </div>
                                {/* Allowed Users: only for single/multiple */}
                                {(form.scope === 'specific') && (
                                    <div className='flex flex-col gap-2'>
                                        {/* <p className='text-sm'>Allowed Users*</p> */}
                                        <div className='flex items-end gap-4'>
                                            <Input
                                                variant='faded'
                                                label="Allowed Users"
                                                placeholder="Enter Registered Phone Number"
                                                labelPlacement='outside'
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
                                            // isDisabled={form.scope === 'single' && form.allowedUsers.length >= 1}
                                            />
                                            <button
                                                type="button"
                                                className='px-4 py-2 rounded-xl border-2 hover:border-orange-400 bg-primary text-white'
                                                onClick={handleAddAllowedUser}
                                            // disabled={form.scope === 'single' && form.allowedUsers.length >= 1}
                                            >
                                                <UserRoundPlus size={20} strokeWidth={1.6} />
                                            </button>
                                        </div>
                                        <div className='flex justify-center gap-x-2 gap-y-2 flex-wrap'>
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
