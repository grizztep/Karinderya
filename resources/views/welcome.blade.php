@extends('layouts.app')

@section('title', 'Welcome')

@section('content')
<div id="root"></div>
@endsection

@push('scripts')
    @vite('resources/js/app.jsx')
@endpush
