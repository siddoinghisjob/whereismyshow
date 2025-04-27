/**
 * Executes a function with a timeout
 * @param func The function to execute
 * @param timeoutMs Timeout in milliseconds
 * @param defaultValue Default value to return if timeout occurs
 * @param args Arguments to pass to the function
 * @returns The result of the function or defaultValue if timeout occurs
 */
async function timedFunction<T>(
  func: (...args: any[]) => Promise<T>,
  timeoutMs: number,
  defaultValue: T,
  ...args: any[]
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });
    
    const result = await Promise.race([
      func(...args),
      timeoutPromise
    ]);
    
    // Clear the timeout when the function resolves
    clearTimeout(timeoutId!);
    return result;
  } catch (e) {
    clearTimeout(timeoutId!);
    return defaultValue;
  }
}

export default timedFunction;