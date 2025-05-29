import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../services/project.service';
import { TaskService } from '../../../../services/task.service';
import { ChartConfiguration } from 'chart.js';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgChartsModule} from 'ng2-charts';
import {UserService} from '../../../../services/user.service';
import {AiService} from '../../../../services/ai.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    DatePipe,
    NgForOf,
    NgClass,
    NgChartsModule,
    FormsModule,
    NgIf
  ],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects: any[] = [];
  tasks: any[] = [];
  userMessage: string = '';
  chatMessages: { content: string, sender: string }[] = [];
 response: { content: string, sender: string }[] = [];

  employees = [
    { name: 'Marcus Levin', location: 'Sunnyvale, CA' },
    { name: 'Wilson Workman', location: 'Mount Olympus, Greece' },
    { name: 'Paityn Schleifer', location: 'Serenity Beach, Maldives' }
  ];

  completionRate = 64.7;
  statusBreakdown: { label: string, count: number, color: string }[] = [];

  statusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#f1c40f', '#3498db', '#2ecc71']
    }]
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '70%'
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Tâches par projet',
      data: [],
      backgroundColor: '#007bff'
    }]
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y'
  };


  constructor(private projectService: ProjectService, private userService: UserService,private AiService:AiService) {}

  ngOnInit(): void {
    this.userService.setcredentials();
    setTimeout(() => {
      let userId = localStorage.getItem('userId') || '';
      this.projectService.getProjectsForCurrentMember(userId).subscribe((projects) => {
        this.projects = projects;
        this.tasks = projects.flatMap((p: { tasks: any; }) => p.tasks || []);
        this.calculateStats();
        this.buildCharts();
      });
    }, 2000);

  }

  calculateStats() {
    const toDo = this.tasks.filter(t => t.status === 'To Do').length;
    const inProgress = this.tasks.filter(t => t.status === 'In Progress').length;
    const done = this.tasks.filter(t => t.status === 'Done').length;

    this.statusChartData.datasets[0].data = [toDo, inProgress, done];

    this.statusBreakdown = [
      { label: 'To Do', count: toDo, color: '#f1c40f' },
      { label: 'In Progress', count: inProgress, color: '#3498db' },
      { label: 'Done', count: done, color: '#2ecc71' }
    ];
  }

  buildCharts() {
    this.barChartData.labels = this.projects.map(p => p.name);
    this.barChartData.datasets[0].data = this.projects.map(p => p.tasks.length);
  }
  sendMessage(): void {
    if (this.userMessage.trim()) {
      this.chatMessages.push({ content: this.userMessage, sender: 'user' });
      this.AiService.getDeepSeekResponse(this.userMessage).subscribe((response) => {
        this.response.push({ content: response, sender: 'assistant' });
        console.log('Response from AI:', response);
        this.userMessage = '';
      });
    }
  }
}
