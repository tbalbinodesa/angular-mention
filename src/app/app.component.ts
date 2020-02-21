import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Angular9';

  ngOnInit(): void {
  }

  addMention($event: string[]) {
    console.log('adding Mentions', $event);
  }
}


