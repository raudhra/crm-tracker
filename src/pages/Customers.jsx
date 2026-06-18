import { useState, useEffect } from 'react'
import { getCustomersWithDetails } from '../services/api'

function Customers() {
    const [customers , setCustomers] = useState([])
    const [loading , setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [search , setSearch] = useState('')
    const [addCustomer, setAddCustomer] = useState(false)

    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await getCustomersWithDetails();
            setCustomers(data);
        };

        fetchCustomers();

    }, []);

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filter === 'All' || customer.status === filter
        return matchesSearch && matchesStatus
    }
    );
    return (
        <div>
            Customers
        </div>
    )
    
}