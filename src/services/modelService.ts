import { spawn } from 'child_process';
import { CsvFile } from '../types';

export const trainModel = async (data: any[]) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['src/Models/model.py', JSON.stringify(data)]);
    
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }

      try {
        const parsedResult = JSON.parse(result);
        resolve(parsedResult);
      } catch (e) {
        reject(new Error('Failed to parse Python output'));
      }
    });
  });
};