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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Customers
                </h1>
                <p className="text-gray-500 text-sm mt-1">Here! Your Customers</p>
            </div>
            <div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder = "Search Customers..."
                    />
                    {['All', 'Active', 'Pending', 'Inactive'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={filter === status ? 'active styles' : 'inactive styles'}
                            > {status} </button>
                    ))}
                    <button
                    onClick={(e) => setAddCustomer(true)} > Add Customer </button>
            </div>
            <div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Profile</th>
                            <th className="p-3 text-left">Name + Email</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Last Contact</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getCustomersWithDetails.map}(customer => (
                            <tr key = {getCustomersWithDetails.id} className="border-b">
                                <td>
                                     getCustomersWithDetails.avatar ? (
                                    <img src={getCustomersWithDetails.avatar} 
                                    alt="getCustomersWithDetails.name" 
                                    className="w-10 h-10 rounded-full object-cover" 
                                        />
                                    ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                            {getCustomersWithDetails.name[0].toUpperCase()}
                                    </div>
                                    )    
                                </td>
                                <td className="p-3">{getCustomersWithDetails.name} + " " + {getCustomersWithDetails.email}</td>
                                <td className="p-3">{getCustomersWithDetails.phone}</td>
                                <td className="p-3">{getCustomersWithDetails.status}</td>
                                <td className="p-3">{getCustomersWithDetails.lastContact}</td>
                                <td className="p-3"><button>:</button></td>
                            </tr>
                        ))
                    </tbody>
                </table>
                
            </div> 
        </div>
    )
    
}