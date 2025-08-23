@extends('layouts.app')

@section('title', 'User Dashboard')

@section('content')
<div id="user-dashboard-root"></div>
@endsection

@push('scripts')
    @vite('resources/js/user/UserDashboard.jsx')
@endpush
