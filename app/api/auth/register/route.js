import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
  phoneNumber: z.string().optional()
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Set default permissions based on role
    const defaultPermissions = ['view_inventory', 'manage_inventory', 'export_data', 'manage_categories', 'view_analytics'];
    
    // Create user
    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      department: validatedData.department,
      phoneNumber: validatedData.phoneNumber,
      permissions: defaultPermissions,
      emailVerificationToken: generateVerificationToken()
    });
    
    await user.save();
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}