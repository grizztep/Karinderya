@extends('layouts.app')

@section('title', 'Admin Dashboard')

@section('content')
<div id="admin-dashboard-root"></div>
@endsection

@push('scripts')
    @vite('resources/js/admin/AdminDashboard.jsx')
@endpush
