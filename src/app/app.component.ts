import { Component, OnInit } from '@angular/core';

interface Alert {
  title: string;
  description: string;
  link: string;
  seen: boolean;
}

const mockAlerts: Alert[] = [
  {
    title: 'Alert 01',
    description: 'Description 01',
    link: 'https://www.google.com',
    seen: false
  },
  {
    title: 'Alert 02',
    description: 'Description 02',
    link: 'https://www.google.com',
    seen: false
  },
  {
    title: 'Alert 03',
    description: 'Description 03',
    link: 'https://www.google.com',
    seen: false
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Angular9';
  alerts: Alert[] = mockAlerts;

  ngOnInit(): void {
  }

  addMention($event: string[]) {
    console.log('adding Mentions', $event);
  }

  goToLink(link: string) {
    console.log('going to:', link);
  }
}


