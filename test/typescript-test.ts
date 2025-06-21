// TypeScript test file with various features to test ESLint rules

// Variables with type annotations
const name: string = 'John';
const age: number = 30;
// Prefix with underscore to indicate unused variable
const _isActive: boolean = true;

// Interface with proper spacing
interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

// Type alias with proper spacing
type UserRole = 'admin' | 'user' | 'guest';

// Function with return type
const getUserInfo = (id: number): User => {
  // Using the variables without console.log
  // Sort keys alphabetically
  const _userInfo = {
    age,
    id,
    name
  };

  return {
    email: 'test@example.com',
    id,
    isAdmin: false,
    name: 'Test User'
  };
};

// Class with type annotations
class UserManager {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  getUser(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}

// Generic function
const createPair = <T, U>(first: T, second: U): [T, U] => [first, second];

// Using the generic function
const unusedPair = createPair<string, number>('hello', 42);

// Export for usage
export {User, UserRole, getUserInfo, UserManager};