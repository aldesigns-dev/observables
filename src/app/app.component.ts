import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { interval, map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  clickCount = signal(0); // Signal
  clickCount$ = toObservable(this.clickCount); // Observable
  intervalValue: number | null = null;

  // Control when it will be emitted
  customInterval$ = new Observable((subscriber) => {
    let timesExecuted = 0;
    const interval = setInterval(() => {
      if (timesExecuted > 3) {
        clearInterval(interval);
        subscriber.complete();
        return;
      }
      console.log('Emitting new value...');
      subscriber.next({message: 'New value'});
      timesExecuted++;
    }, 2000);
  });

  private destroyRef = inject(DestroyRef);
  private message = signal('Hello');

  constructor() {
    effect(() => {
      console.log('effect(): Clicked button ' + this.clickCount() + ' times.');
      console.log('Signal in effect() is een automatische subscription: ' + this.message());
    });
  }

  ngOnInit() {
    console.log('Signal in OnInit() kun je lezen zonder subscription: ' + this.message());
    const subscriptionInterval = interval(100).pipe(
      map((val) => val * 2)
    ).subscribe({
      // next: (val) => console.log(val),
      // next: (val) => this.intervalValue.set(val)
      next: (val) => {
        this.intervalValue = val;
      }
    });
    this.customInterval$.subscribe({
      next: (val) => console.log(val),
      complete: () => console.log('COMPLETED!')
    });
    const subscriptionClickCount = this.clickCount$.subscribe({
      next: (val) => console.log(`ngOnInit(): Clicked button ${this.clickCount()} times.`)
    })

    // Opschonen bij destroy. 
    this.destroyRef.onDestroy(() => {
      subscriptionInterval.unsubscribe();
      subscriptionClickCount.unsubscribe();
    });
  }

  onClick() {
    this.clickCount.update(prevCount => prevCount + 1);
  }
}
